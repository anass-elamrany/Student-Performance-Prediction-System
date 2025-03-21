import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Paper
} from '@mui/material';

const StudentRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get('/api/student/recommendations/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        setRecommendations(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des recommandations. Veuillez réessayer plus tard.');
        setLoading(false);
        console.error('Error fetching recommendations:', err);
      }
    };
    
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="div" sx={{ fontWeight: 'bold', mb: 3 }}>
        Mes recommandations
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={3}>
        {recommendations.length > 0 ? (
          recommendations.map((recommendation) => (
            <Grid item xs={12} md={6} key={recommendation.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip 
                      label={recommendation.matiere} 
                      color="primary" 
                      size="small" 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(recommendation.date_creation)}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    {recommendation.contenu}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1">
                Aucune recommandation à afficher pour le moment.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default StudentRecommendations;