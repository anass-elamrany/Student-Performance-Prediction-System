import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider, TextField, Button } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import SchoolIcon from '@mui/icons-material/School';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#05192D', // DataCamp Navy
        color: 'white',
        pt: 10,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ mr: 1, fontSize: 32, color: '#9C27B0' }} />
              <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                EduPredict
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 4, lineHeight: 1.8 }}>
              Notre mission est de démocratiser l'excellence éducative grâce à l'intelligence artificielle. Nous aidons les établissements à mieux comprendre et soutenir leurs étudiants.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[<FacebookIcon />, <TwitterIcon />, <LinkedInIcon />, <InstagramIcon />].map((icon, index) => (
                <IconButton 
                  key={index} 
                  sx={{ 
                    color: 'white', 
                    '&:hover': { color: '#03EF62', bgcolor: 'rgba(255,255,255,0.1)' } 
                  }}
                >
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#9C27B0' }}>
              PRODUIT
            </Typography>
            {['Fonctionnalités', 'Pour les Profs', 'Pour les Étudiants', 'Sécurité', 'Tarifs'].map((item) => (
              <Box key={item} sx={{ mb: 1.5 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ color: '#b3b3b3', '&:hover': { color: 'white' } }}>
                  {item}
                </Link>
              </Box>
            ))}
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#9C27B0' }}>
              RESSOURCES
            </Typography>
            {['Blog', 'Documentation', 'Tutoriels', 'Support', 'Contact'].map((item) => (
              <Box key={item} sx={{ mb: 1.5 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ color: '#b3b3b3', '&:hover': { color: 'white' } }}>
                  {item}
                </Link>
              </Box>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#9C27B0' }}>
              NEWSLETTER
            </Typography>
            <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 2 }}>
              Recevez nos dernières actualités et conseils pédagogiques.
            </Typography>
            <Box component="form" noValidate sx={{ display: 'flex' }}>
              <TextField
                placeholder="Votre email"
                variant="outlined"
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 0,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'transparent' },
                    color: 'white',
                  }
                }}
              />
              <Button 
                variant="contained" 
                color="secondary"
                sx={{ 
                  borderRadius: 0,
                  color: '#05192D',
                  fontWeight: 700
                }}
              >
                S'abonner
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
            © {new Date().getFullYear()} EduPredict Inc.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" variant="body2" sx={{ color: '#b3b3b3', textDecoration: 'none', '&:hover': { color: 'white' } }}>
              Conditions d'utilisation
            </Link>
            <Link href="#" variant="body2" sx={{ color: '#b3b3b3', textDecoration: 'none', '&:hover': { color: 'white' } }}>
              Politique de confidentialité
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
