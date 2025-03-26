import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useTheme
} from '@mui/material';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { checkAuthStatus, getUserRole, refreshToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [matiereStats, setMatiereStats] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [matieres, setMatieres] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();

  // Check authentication and user role on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const user = await checkAuthStatus();
      if (!user || getUserRole() !== 'teacher') {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch matieres and data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch matieres taught by the teacher
        const matieresResponse = await fetchWithTokenRefresh('http://localhost:8000/api/teacher/matieres/');
        const matieresData = await matieresResponse.json();
        if (matieresData.success) {
          setMatieres(matieresData.matieres);
          if (matieresData.matieres.length > 0) {
            setSelectedMatiere(matieresData.matieres[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching matieres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch data when selectedMatiere changes
  useEffect(() => {
    if (selectedMatiere) {
      fetchMatiereData(selectedMatiere);
    }
  }, [selectedMatiere]);

  // Fetch statistics and grade distribution for the selected matiere
  const fetchMatiereData = async (matiereId) => {
    setLoading(true);
    try {
      // Fetch teacher statistics for the selected matiere
      const statsResponse = await fetchWithTokenRefresh(
        `http://localhost:8000/api/teacher/statistics/?matiere_id=${matiereId}`
      );
      const statsData = await statsResponse.json();

      if (!statsResponse.ok) {
        throw new Error(statsData.message || 'Erreur lors de la récupération des statistiques');
      }

      if (statsData.success) {
        setMatiereStats(statsData.matiere_stats);
      }

      // Fetch grade distribution for the selected matiere
      const gradeResponse = await fetchWithTokenRefresh(
        `http://localhost:8000/api/teacher/grade-distribution/?matiere_id=${matiereId}`
      );
      const gradeData = await gradeResponse.json();

      if (!gradeResponse.ok) {
        throw new Error(gradeData.message || 'Erreur lors de la récupération de la distribution des notes');
      }

      if (gradeData.success) {
        setGradeDistribution(gradeData.grade_distribution);
      }

    } catch (error) {
      console.error('Error fetching matiere data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle token refresh and API requests
  const fetchWithTokenRefresh = async (url, options = {}) => {
    let token = localStorage.getItem('accessToken');
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    // If the request fails with a 401 error, try refreshing the token
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        // Retry the request with the new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
      } else {
        // Log out the user if the refresh fails
        logout();
        return null;
      }
    }

    return response;
  };

  // Handle Matiere filter change
  const handleMatiereChange = (event) => {
    setSelectedMatiere(event.target.value);
  };

  // Summary stats
  const summaryStats = [
    { 
      title: 'Matières enseignées', 
      value: matieres.length, 
      icon: <PeopleIcon fontSize="large" />, 
      color: theme.palette.primary.main,
      description: 'Nombre total de matières'
    },
    { 
      title: 'Moyenne de la classe', 
      value: matiereStats.length > 0 ? `${matiereStats[0].average_grade}/20` : '0/20', 
      icon: <TrendingUpIcon fontSize="large" />, 
      color: theme.palette.success.main || '#4caf50',
      description: 'Performance moyenne'
    },
    { 
      title: 'Meilleure note', 
      value: matiereStats.length > 0 ? `${matiereStats[0].highest_grade}/20` : '0/20', 
      icon: <WarningIcon fontSize="large" />, 
      color: theme.palette.warning.main || '#ff9800',
      description: 'Note la plus élevée'
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Tableau de Bord Enseignant
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Bienvenue! Voici un aperçu de vos classes et activités récentes.
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {/* Matiere Filter */}
      <Box sx={{ mb: 4 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="matiere-filter-label">Sélectionner une Matière</InputLabel>
          <Select
            labelId="matiere-filter-label"
            value={selectedMatiere}
            onChange={handleMatiereChange}
            label="Sélectionner une Matière"
          >
            {matieres.map((matiere) => (
              <MenuItem key={matiere.id} value={matiere.id}>
                {matiere.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              elevation={2}
              sx={{ 
                height: 140, 
                borderLeft: `4px solid ${stat.color}`,
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {stat.title}
                </Typography>
                <Typography variant="h3" sx={{ mt: 2, fontWeight: "bold", color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Grade Distribution */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="medium">
                  Distribution des Notes - {matieres.find(m => m.id === selectedMatiere)?.nom || ''}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 320 }}>
                {gradeDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="range" tick={{ fill: theme.palette.text.secondary }} />
                      <YAxis tick={{ fill: theme.palette.text.secondary }} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper,
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.primary
                        }}
                      />
                      <Bar dataKey="count" fill={theme.palette.primary.main} name="Nombre d'élèves" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    color: theme.palette.text.secondary
                  }}>
                    Aucune donnée disponible pour cette matière
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default TeacherDashboard;

function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}