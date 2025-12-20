import React from 'react';
import { Box, Container, Typography, Button, Grid, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
  const roles = [
    {
      title: "Administrateurs : Gestion & Alertes",
      description: "Supervisez le système global. Gérez les données des étudiants, surveillez les indicateurs de performance à l'échelle de l'établissement et configurez les paramètres des algorithmes de prédiction (Arbres de décision, SVM).",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", // Dashboard/Analytics
      buttonText: "Accéder au tableau de bord",
      imagePosition: "left",
      color: "primary.main",
      onButtonClick: () => {}
    },
    {
      title: "Enseignants : Intervention Précoce",
      description: "Identifiez rapidement les étudiants à risque grâce au système d'alerte. Visualisez les prédictions de performance pour chaque cours et recevez des recommandations pour adapter votre enseignement et proposer du soutien ciblé.",
      image: "https://images.unsplash.com/photo-1577896336189-d464cb3f3458?auto=format&fit=crop&w=800&q=80", // Teacher/Classroom
      buttonText: "Suivre mes étudiants",
      imagePosition: "right",
      color: "secondary.main",
      onButtonClick: () => {}
    },
    {
      title: "Étudiants : Orientation & Réussite",
      description: "Consultez vos prédictions de réussite et découvrez les parcours recommandés pour vous. L'IA analyse vos résultats passés pour vous suggérer les modules les mieux adaptés à votre profil et maximiser vos chances de succès.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80", // Student/Library
      buttonText: "Voir mon profil",
      imagePosition: "left",
      color: "primary.main",
      onButtonClick: () => {}
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
