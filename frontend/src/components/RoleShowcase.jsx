import React from 'react';
import { Box, Container, Typography, Button, Grid, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import adminImage from '../assets/images/admin.jpg';
import teacherImage from '../assets/images/teacher.png';
import studentImage from '../assets/images/student-learning.png';

const RoleSection = ({ title, description, image, imagePosition, buttonText, onButtonClick }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ py: 10 }}>
      <Grid container spacing={6} alignItems="center" direction={imagePosition === 'right' ? 'row' : 'row-reverse'}>
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
              {description}
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              endIcon={<ArrowForwardIcon />}
              onClick={onButtonClick}
              sx={{ 
                borderRadius: 0, 
                px: 4, 
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              {buttonText}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box 
            component="img"
            src={image}
            alt={title}
            sx={{
              width: '100%',
              borderRadius: '20px',
              boxShadow: theme.shadows[10],
              transform: 'scale(1)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
              }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const RoleShowcase = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Administrateurs",
      description: "Vision globale de l'établissement. Suivez les indicateurs clés et gérez les données pour piloter la réussite.",
      image: adminImage,
      buttonText: "Gérer la plateforme",
      imagePosition: "left",
      color: "primary.main",
      onButtonClick: () => navigate('/login')
    },
    {
      title: "Enseignants",
      description: "Détectez les difficultés à temps. Recevez des alertes sur les étudiants à risque et adaptez votre soutien.",
      image: teacherImage,
      buttonText: "Suivre mes classes",
      imagePosition: "right",
      color: "secondary.main",
      onButtonClick: () => navigate('/login')
    },
    {
      title: "Étudiants",
      description: "Votre avenir en main. visualisez vos progrès et recevez des conseils personnalisés pour réussir.",
      image: studentImage,
      buttonText: "Voir mes prédictions",
      imagePosition: "left",
      color: "primary.main",
      onButtonClick: () => navigate('/login')
    }
  ];

  return (
    <Box sx={{ py: 12, bgcolor: 'background.default' }} id="roles">
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 12 }}>
          <Typography variant="subtitle1" color="secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, mb: 2 }}>
            FONCTIONNALITÉS CIBLÉES
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>
            Une solution adaptée à <Box component="span" sx={{ color: 'secondary.main' }}>chaque acteur</Box>
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
            Du pilotage stratégique à la réussite individuelle, notre système de classification connecte tous les niveaux de l'université.
          </Typography>
        </Box>

        {roles.map((role, index) => (
          <RoleSection key={index} {...role} />
        ))}
      </Container>
    </Box>
  );
};

export default RoleShowcase;
