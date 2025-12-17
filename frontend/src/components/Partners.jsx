import React from 'react';
import { Box, Container, Typography } from '@mui/material';

// Using text placeholders for logos to ensure reliability without external assets
const partners = ['Harvard University', 'MIT', 'Stanford', 'Coursera', 'Google for Education'];

const Partners = () => {
  return (
    <Box sx={{ py: 6, bgcolor: 'background.paper', borderBottom: '1px solid #e0e0e0' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
          Recommandé par les meilleurs établissements
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: 4,
            opacity: 0.6
          }}
        >
          {partners.map((partner, index) => (
            <Typography 
              key={index} 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                filter: 'grayscale(100%)',
                transition: 'all 0.3s',
                cursor: 'default',
                '&:hover': {
                  filter: 'grayscale(0%)',
                  opacity: 1,
                  color: 'primary.main'
                }
              }}
            >
              {partner}
            </Typography>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Partners;
