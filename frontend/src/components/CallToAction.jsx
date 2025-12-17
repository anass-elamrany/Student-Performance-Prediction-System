import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        py: 10,
        textAlign: 'center'
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 800, mb: 3 }}>
          Accès Réservé UMP
        </Typography>
        <Typography variant="h5" sx={{ mb: 5, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
          Cette plateforme est exclusivement réservée aux étudiants et enseignants de l'Université Mohammed Premier. Vos identifiants vous sont fournis par l'administration.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            onClick={() => navigate("/login")}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 700, color: 'primary.main' }}
          >
            Se connecter
          </Button>
          <Button 
            variant="outlined" 
            color="inherit" 
            size="large"
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
          >
            Support Administration
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default CallToAction;
