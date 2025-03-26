import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  LinearProgress,
  Grid,
  Divider,
  Chip,
  Badge,
  alpha,
  useTheme
} from "@mui/material";
import { 
  Lightbulb, 
  School, 
  CalendarToday,
  Assignment,
  PriorityHigh
} from "@mui/icons-material";
import { fetchWithTokenRefresh } from "../../utils/auth";

const StudentRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  
  // Student theme color matching the StudentAlerts component
  const studentColor = "#ff9800";

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
        <LinearProgress sx={{ 
          height: 6, 
          borderRadius: 3,
          backgroundColor: alpha(studentColor, 0.15),
          '& .MuiLinearProgress-bar': {
            backgroundColor: studentColor
          }
        }} />
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

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    
    try {
      // Try multiple parsing strategies
      let date;
      
      // First, try parsing as ISO format
      date = new Date(dateString);
      
      // If that fails, try parsing with French date format (DD/MM/YYYY)
      if (isNaN(date.getTime())) {
        const [day, month, year] = dateString.split('/');
        date = new Date(year, month - 1, day);
      }
      
      // If still invalid, return "Date inconnue"
      if (isNaN(date.getTime())) {
        return "Date inconnue";
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      console.error("Erreur de formatage de date:", e);
      return "Date inconnue";
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: "bold", 
              color: studentColor 
            }}
          >
            Mes Recommandations
          </Typography>
        </Box>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          gutterBottom
          sx={{ ml: 0.5 }}
        >
          Consultez les recommandations personnalisées pour améliorer vos performances
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {recommendations.length === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: "center", 
            mt: 3, 
            borderRadius: 2,
            border: `1px solid ${alpha(studentColor, 0.2)}`
          }}
        >
          <Lightbulb 
            sx={{ 
              fontSize: 60, 
              color: alpha(studentColor, 0.7), 
              mb: 2 
            }} 
          />
          <Typography variant="h6">
            Aucune recommandation disponible pour le moment.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Les recommandations apparaîtront ici lorsque vos enseignants ou le système en génèreront.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Recent recommendations */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                display: "flex",
                alignItems: "center",
                color: theme.palette.mode === "light" ? "#333333" : "#ffffff",
                fontWeight: 600
              }}
            >
              <Lightbulb 
                sx={{ 
                  mr: 1, 
                  verticalAlign: "middle",
                  color: studentColor
                }} 
              />
              Recommandations récentes
            </Typography>
            <Grid container spacing={3}>
              {recommendations.slice(0, 3).map((recommendation) => (
                <Grid item xs={12} md={4} key={recommendation.id}>
                  <Card 
                    sx={{ 
                      height: "100%", 
                      borderRadius: 2,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4
                      },
                      overflow: "hidden",
                      border: `1px solid ${alpha(studentColor, 0.1)}`
                    }}
                  >
                    <Box 
                      sx={{ 
                        height: 8, 
                        backgroundColor: studentColor
                      }} 
                    />
                    <CardContent>
                      {recommendation.matiere && (
                        <Chip 
                          icon={<School />} 
                          label={recommendation.matiere.nom} 
                          sx={{
                            backgroundColor: alpha(studentColor, 0.1),
                            color: studentColor,
                            fontWeight: 500,
                            mb: 2,
                            "& .MuiChip-icon": {
                              color: studentColor
                            }
                          }}
                          size="small"
                        />
                      )}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 1,
                          height: 80,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          color: theme.palette.text.secondary
                        }}
                      >
                        {recommendation.contenu}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CalendarToday 
                          fontSize="small" 
                          sx={{ 
                            color: alpha(studentColor, 0.8), 
                            mr: 1 
                          }} 
                        />
                        <Typography 
                          variant="caption" 
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 500
                          }}
                        >
                          {formatDate(recommendation.date_creation)}
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
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                display: "flex",
                alignItems: "center",
                color: theme.palette.mode === "light" ? "#333333" : "#ffffff",
                fontWeight: 600
              }}
            >
              <School 
                sx={{ 
                  mr: 1, 
                  verticalAlign: "middle",
                  color: studentColor
                }} 
              />
              Recommandations par matière
            </Typography>
            
            {Object.entries(groupedRecommendations).map(([subject, subjectRecommendations]) => (
              <Paper 
                key={subject} 
                sx={{ 
                  mb: 3, 
                  p: 3,
                  borderRadius: 2,
                  borderLeft: `6px solid ${alpha(studentColor, 0.7)}`,
                }}
                elevation={2}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Badge 
                    badgeContent={subjectRecommendations.length} 
                    color="primary"
                    sx={{ mr: 2 }}
                  >
                    <School 
                      sx={{ 
                        color: studentColor
                      }} 
                    />
                  </Badge>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: "bold",
                      color: theme.palette.mode === "light" ? "#333333" : "#ffffff"
                    }}
                  >
                    Matière: {subject}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {subjectRecommendations.map((recommendation, index) => (
                  <Box 
                    key={recommendation.id} 
                    sx={{ 
                      mb: index < subjectRecommendations.length - 1 ? 2 : 0, 
                      pb: index < subjectRecommendations.length - 1 ? 2 : 0, 
                      borderBottom: index < subjectRecommendations.length - 1 ? 1 : 0, 
                      borderColor: "divider",
                      "&:hover": {
                        backgroundColor: alpha(studentColor, 0.03)
                      },
                      borderRadius: 1,
                      p: 1.5
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: theme.palette.text.secondary,
                        py: 1
                      }}
                    >
                      {recommendation.contenu}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <CalendarToday 
                        fontSize="small" 
                        sx={{ 
                          color: alpha(studentColor, 0.7), 
                          mr: 1 
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500
                        }}
                      >
                        {formatDate(recommendation.date_creation)}
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