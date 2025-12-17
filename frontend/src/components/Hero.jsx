import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Stack, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/images/background.png';

const Hero = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box 
      sx={{ 
        position: 'relative',
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Parallax effect
        pt: { xs: 12, md: 24 },
        pb: { xs: 8, md: 20 },
        overflow: 'hidden',
        minHeight: '90vh', // Ensure full viewport feel
        display: 'flex',
        alignItems: 'center',
        // Overlay removed as requested
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', textAlign: 'center' }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'secondary.main', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: 3, 
              mb: 3,
              display: 'inline-block',
              px: 2,
              py: 1,
              bgcolor: 'rgba(156, 39, 176, 0.1)',
              borderRadius: 2
            }}
          >
            Orientation Académique & Réussite - UMP
          </Typography>
          
          <Typography 
            component="h1" 
            variant="h1" 
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '2.5rem', md: '4.5rem' },
              lineHeight: 1.1,
              mb: 4,
              color: '#ffffff', // White text
              textShadow: '0 2px 10px rgba(0,0,0,0.3)' // Stronger shadow
            }}
          >
            Classification et <br/>
            <Box component="span" sx={{ 
              color: '#ffffff', // Keep white or use a very light secondary tint
              position: 'relative',
              display: 'inline-block',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 8,
                left: 0,
                width: '100%',
                height: '15px',
                bgcolor: 'secondary.main',
                opacity: 0.8, // Increased opacity for visibility
                zIndex: -1,
                transform: 'rotate(-2deg)'
              }
            }}>
              Prédiction
            </Box> des Performances
          </Typography>

          <Typography 
            variant="h5" 
            paragraph 
            sx={{ 
              mb: 6, 
              maxWidth: 750, 
              mx: 'auto', 
              fontWeight: 500, 
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.25rem' },
              color: '#f0f0f0', // Off-white for description
              textShadow: '0 1px 4px rgba(0,0,0,0.5)'
            }}
          >
            Une plateforme intelligente pour l'Université Mohammed Premier, utilisant l'IA pour orienter les décisions académiques, anticiper les besoins et personnaliser les parcours de réussite.
          </Typography>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
            alignItems="center"
          >
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate("/login")}
              endIcon={<ArrowForwardIcon />} 
              sx={{ 
                px: 5, 
                py: 2, 
                fontSize: '1.1rem', 
                borderRadius: 2,
                boxShadow: '0 10px 25px rgba(5, 25, 45, 0.3)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-3px)' }
              }}
            >
              Accéder à la plateforme
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};
export default Hero;
