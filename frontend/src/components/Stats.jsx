import React from 'react';
import { Box, Container, Grid, Typography, Paper } from '@mui/material';

const stats = [
  { value: '1k+', label: 'Étudiants Actifs' },
  { value: '92%', label: 'Taux de Précision' },
  { value: '4+', label: 'Établissements' },
  { value: '24/7', label: 'Support Technique' },
];

const Stats = () => {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }} id="stats">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  bgcolor: 'transparent',
                  borderRight: { md: index !== 3 ? '1px solid #e0e0e0' : 'none' }
                }}
              >
                <Typography variant="h3" component="div" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Stats;
