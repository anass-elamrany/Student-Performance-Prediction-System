import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  InputAdornment, 
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, SupervisorAccount, School, Person } from '@mui/icons-material';

const LoginForm = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleInfo = {
    admin: {
      title: 'Connexion Administrateur',
      icon: <SupervisorAccount fontSize="large" sx={{ color: '#3f51b5' }} />,
      redirectPath: '/admin/dashboard',
      color: '#3f51b5'
    },
    teacher: {
      title: 'Connexion Enseignant',
      icon: <School fontSize="large" sx={{ color: '#4caf50' }} />,
      redirectPath: '/teacher/dashboard',
      color: '#4caf50'
    },
    student: {
      title: 'Connexion Étudiant',
      icon: <Person fontSize="large" sx={{ color: '#ff9800' }} />,
      redirectPath: '/student/dashboard',
      color: '#ff9800'
    }
  };

  useEffect(() => {
    // Check if the role is valid
    if (!roleInfo[role]) {
      navigate('/login');
    }
    
    // Check if there's a remembered username
    const savedUsername = localStorage.getItem('username');
    const savedRole = localStorage.getItem('userRole');
    
    if (savedUsername && savedRole === role) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername,
        rememberMe: true
      }));
    }
  }, [role, navigate]);

  // If the role doesn't exist in our mapping, return null (useEffect will handle the redirect)
  if (!roleInfo[role]) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: role
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Stocker les tokens dans localStorage
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
  
        // Stocker les informations de l'utilisateur dans sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
        
        // Rediriger vers le tableau de bord approprié
        navigate(roleInfo[role].redirectPath);
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Erreur de connexion:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ 
            p: 2, 
            borderRadius: '50%', 
            bgcolor: `${roleInfo[role].color}20`,
            mb: 2 
          }}>
            {roleInfo[role].icon}
          </Box>
          <Typography variant="h5" component="h1" align="center">
            {roleInfo[role].title}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nom d'utilisateur"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                name="rememberMe" 
                color="primary" 
                checked={formData.rememberMe}
                onChange={handleChange}
              />
            }
            label="Se souvenir de moi"
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2, 
              bgcolor: roleInfo[role].color,
              '&:hover': {
                bgcolor: `${roleInfo[role].color}CC`,
              }
            }}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="text" color="primary">
                Changer de rôle
              </Button>
            </Link>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginForm;