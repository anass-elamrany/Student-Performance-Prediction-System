// @ts-nocheck
import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import logoEST from '../assets/images/logoEST.jpg';
import logoENIAD from '../assets/images/logoENIAD.jpg';
import logoENSA from '../assets/images/logoENSA.jpg';


const partners = [
  { name: 'École Supérieure de Technologie - Oujda', logo: logoEST },
  { name: "École Nationale de l'Intelligence Artificielle et du Digital", logo: logoENIAD },
  { name: 'École Nationale des Sciences Appliquées - Oujda', logo: logoENSA },

];

const Partners = () => {
  return (
    <Box sx={{ py: 6, bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 6, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
          Utilisé par les meilleurs établissements
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: { xs: 4, md: 8 }
          }}
        >
          {partners.map((partner, index) => (
            <Box 
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'row', // Horizontal layout
                alignItems: 'center',
                gap: 2,
                opacity: 0.7,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                maxWidth: '300px', // Prevent too wide
                '&:hover': {
                  opacity: 1,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box
                component="img"
                src={partner.logo}
                alt={partner.name}
                sx={{
                  height: 50, // Slightly smaller for row layout
                  width: 'auto',
                  filter: 'grayscale(100%)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    filter: 'grayscale(0%)',
                  }
                }}
              />
              <Typography 
                 variant="subtitle2" 
                 align="left"
                 sx={{ 
                   fontWeight: 700, 
                   color: 'text.primary',
                   lineHeight: 1.2
                 }}
              >
                {partner.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Partners;
