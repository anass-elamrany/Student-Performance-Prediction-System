import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar, Rating } from '@mui/material';

const testimonials = [
  {
    name: "Sarah M.",
    role: "Proviseure",
    content: "EduPredict a transformé la façon dont nous suivons nos élèves. Nous avons réduit le taux d'échec de 15% en un an.",
    avatar: "S",
    rating: 5
  },
  {
    name: "Thomas Dubois",
    role: "Enseignant",
    content: "L'interface est intuitive et les prédictions sont étonnamment précises. Un outil indispensable pour ma classe.",
    avatar: "T",
    rating: 5
  },
  {
    name: "Léa Petit",
    role: "Étudiante",
    content: "Grâce aux recommandations, j'ai pu identifier mes lacunes et améliorer mes notes en mathématiques.",
    avatar: "L",
    rating: 4
  }
];

const Testimonials = () => {
  return (
    <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6 }}>
          Ils nous font confiance
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Rating value={testimonial.rating} readOnly />
                  </Box>
                  <Typography variant="body1" paragraph sx={{ mb: 3, fontStyle: 'italic' }}>
                    "{testimonial.content}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', mr: 2 }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials;
