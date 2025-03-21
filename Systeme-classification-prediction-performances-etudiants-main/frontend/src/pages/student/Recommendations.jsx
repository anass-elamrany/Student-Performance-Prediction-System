import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  LinearProgress,
  Grid,
  Divider,
  Chip
} from "@mui/material";
import { Lightbulb, School, CalendarToday } from "@mui/icons-material";
import { fetchWithTokenRefresh } from "../../utils/auth";

const StudentRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetchWithTokenRefresh("http://localhost:8000/api/student/recommendations/");
      const data = await response.json();

      console.log("API Response:", data); // Debugging: Log the API response

      if (data.success && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      } else {
        console.error("Invalid API response format:", data);
        setRecommendations([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des recommandations:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  // Group recommendations by subject
  const groupedRecommendations = recommendations.reduce((groups, recommendation) => {
    const subject = recommendation.matiere ? recommendation.matiere.nom : "Général";
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push(recommendation);
    return groups;
  }, {});

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mes Recommandations
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Consultez les recommandations personnalisées pour améliorer vos performances
      </Typography>

      {recommendations.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", mt: 3 }}>
          <Lightbulb sx={{ fontSize: 40, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6">
            Aucune recommandation disponible pour le moment.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Les recommandations apparaîtront ici lorsque vos enseignants ou le système en génèreront.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Recent recommendations */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              <Lightbulb sx={{ mr: 1, verticalAlign: "middle" }} />
              Recommandations récentes
            </Typography>
            <Grid container spacing={3}>
              {recommendations.slice(0, 3).map((recommendation) => (
                <Grid item xs={12} md={4} key={recommendation.id}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      {recommendation.matiere && (
                        <Chip 
                          icon={<School />} 
                          label={recommendation.matiere.nom} 
                          color="primary" 
                          size="small" 
                          sx={{ mb: 2 }} 
                        />
                      )}
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {recommendation.contenu}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                        <CalendarToday fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {recommendation.date_creation}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* All recommendations by subject */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              <School sx={{ mr: 1, verticalAlign: "middle" }} />
              Recommandations par matière
            </Typography>
            
            {Object.entries(groupedRecommendations).map(([subject, subjectRecommendations]) => (
              <Paper key={subject} sx={{ mb: 3, p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  {subject}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {subjectRecommendations.map((recommendation) => (
                  <Box key={recommendation.id} sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: "divider" }}>
                    <Typography variant="body1">
                      {recommendation.contenu}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <CalendarToday fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {recommendation.date_creation}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default StudentRecommendations;