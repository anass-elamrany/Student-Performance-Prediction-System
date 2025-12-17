import React from 'react';
import { Box, Container, Typography, Button, Grid, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <Box
      id="accueil"
      sx={{
        position: 'relative',
        bgcolor: 'background.paper',
        pt: { xs: 12, md: 20 },
        pb: { xs: 8, md: 16 },
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'secondary.main', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: 2, 
                  mb: 2 
                }}
              >
                Orientation Académique & Réussite - UMP
              </Typography>
              <Typography 
                component="h1" 
                variant="h1" 
                color="primary.main" 
                sx={{ 
                  fontWeight: 800, 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  mb: 3 
                }}
              >
                Classification et <br/>
                <Box component="span" sx={{ color: 'secondary.main' }}>Prédiction</Box> des Performances
              </Typography>

              <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 5, maxWidth: 550, fontWeight: 400, lineHeight: 1.6 }}>
                Une plateforme intelligente pour l'Université Mohammed Premier, utilisant l'IA pour orienter les décisions académiques, anticiper les besoins et personnaliser les parcours de réussite.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => navigate("/login")}
                  endIcon={<ArrowForwardIcon />} 
                  sx={{ px: 4, py: 1.8, fontSize: '1rem', boxShadow: '0 10px 20px rgba(5, 25, 45, 0.2)' }}
                >
                  Accéder à la plateforme
                </Button>
              </Stack>
            </Box>
          </Grid>
        
        </Grid>
      </Container>
    </Box>
  );
}
