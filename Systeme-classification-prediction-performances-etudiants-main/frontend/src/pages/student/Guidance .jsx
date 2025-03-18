import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  CircularProgress,
} from "@mui/material";
import {
  Lightbulb,
  School,
  Assignment,
  EmojiEvents,
  Work,
  MenuBook,
  PlayArrow,
  Psychology,
  ArrowForward,
  Star,
  CalendarMonth,
  Apartment,
  Download,
  Info,
} from "@mui/icons-material";

const StudentGuidance = () => {
  const [guidanceData, setGuidanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un appel API pour récupérer les données d'orientation
    const fetchGuidanceData = async () => {
      try {
        // Remplacer par un vrai appel API
        setTimeout(() => {
          const data = {
            studentProfile: {
              name: "Alexandre Dupont",
              strengths: ["Bases de données", "Analyse de données", "Programmation Web"],
              recommendedPaths: [
                {
                  title: "Data Science",
                  match: 87,
                  description: "Ce parcours est idéal pour les étudiants ayant de bonnes bases en analyse de données et mathématiques appliquées.",
                  courses: ["Machine Learning", "Big Data", "Statistiques Avancées"],
                  careers: ["Data Scientist", "Data Analyst", "Data Engineer"],
                },
                {
                  title: "Développement Web Fullstack",
                  match: 75,
                  description: "Ce parcours est recommandé pour les étudiants ayant de bonnes compétences en programmation web et en bases de données.",
                  courses: ["React/Angular", "Node.js", "DevOps"],
                  careers: ["Développeur Web Fullstack", "Architecte Web", "DevOps Engineer"],
                },
                {
                  title: "Intelligence Artificielle",
                  match: 68,
                  description: "Ce parcours est recommandé pour les étudiants intéressés par l'apprentissage automatique et les systèmes intelligents.",
                  courses: ["Deep Learning", "NLP", "Computer Vision"],
                  careers: ["AI Engineer", "ML Engineer", "AI Researcher"],
                },
              ],
            },
            resources: {
              courses: [
                {
                  title: "Introduction au Machine Learning",
                  provider: "Coursera",
                  difficulty: "Intermédiaire",
                  duration: "8 semaines",
                  rating: 4.8,
                  type: "MOOC",
                  link: "#",
                },
                {
                  title: "React pour les débutants",
                  provider: "Udemy",
                  difficulty: "Débutant",
                  duration: "6 semaines",
                  rating: 4.5,
                  type: "MOOC",
                  link: "#",
                },
                {
                  title: "Bases de Données Avancées",
                  provider: "EdX",
                  difficulty: "Avancé",
                  duration: "10 semaines",
                  rating: 4.6,
                  type: "MOOC",
                  link: "#",
                },
              ],
            },
            careerPrediction: {
              fields: [
                { name: "Data Science", match: 87, growth: "Forte demande", salary: "Élevé" },
                { name: "Développement Web", match: 75, growth: "Demande stable", salary: "Moyen à élevé" },
                { name: "IA / Machine Learning", match: 68, growth: "Forte croissance", salary: "Très élevé" },
              ],
              skills: [
                { name: "Python", importance: 95 },
                { name: "SQL", importance: 90 },
                { name: "Analyse de données", importance: 85 },
                { name: "JavaScript", importance: 80 },
                { name: "Machine Learning", importance: 75 },
              ],
              nextSteps: [
                "Améliorer vos compétences en machine learning",
                "Réaliser un projet personnel en analyse de données",
                "Rechercher un stage en data science pour l'été prochain",
              ],
            },
          };
          setGuidanceData(data);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors de la récupération des données d'orientation:", error);
        setLoading(false);
      }
    };

    fetchGuidanceData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const { studentProfile, resources, careerPrediction } = guidanceData;

  return (
    <Box>
      {/* Header with information notice */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: "#f5f9ff", 
          border: "1px solid #e0e9fc",
          borderRadius: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Info color="primary" sx={{ mr: 2, fontSize: 40 }} />
          <Box>
            <Typography variant="h5" gutterBottom>
              Recommandations personnalisées
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ces recommandations sont générées par le système en fonction de vos performances académiques 
              et de vos centres d'intérêt. Consultez un conseiller d'orientation pour plus d'informations.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Parcours recommandés */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          <School sx={{ mr: 1, verticalAlign: "middle" }} />
          Parcours recommandés pour vous
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {studentProfile.recommendedPaths.map((path, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: "100%", 
                  borderTop: 5, 
                  borderColor: path.match > 80 ? "success.main" : path.match > 60 ? "primary.main" : "grey.400",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">{path.title}</Typography>
                    <Chip 
                      label={`${path.match}% match`} 
                      color={path.match > 80 ? "success" : path.match > 60 ? "primary" : "default"} 
                      size="small" 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {path.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Cours recommandés:
                  </Typography>
                  <List dense>
                    {path.courses.map((course, idx) => (
                      <ListItem key={idx} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <MenuBook fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={course} />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Débouchés:
                  </Typography>
                  <List dense>
                    {path.careers.map((career, idx) => (
                      <ListItem key={idx} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <Work fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={career} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Prévisions de carrière */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          <Work sx={{ mr: 1, verticalAlign: "middle" }} />
          Prévisions de carrière
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Domaines compatibles
            </Typography>
            <List>
              {careerPrediction.fields.map((field, index) => (
                <ListItem key={index} 
                  sx={{ 
                    px: 0, 
                    mb: 1, 
                    backgroundColor: field.match > 80 ? "rgba(76, 175, 80, 0.1)" : "transparent",
                    borderRadius: 1,
                    border: field.match > 80 ? "1px solid rgba(76, 175, 80, 0.3)" : "none"
                  }}
                >
                  <ListItemIcon>
                    <Apartment color={field.match > 80 ? "success" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={field.name} 
                    secondary={`Match: ${field.match}% | Croissance: ${field.growth} | Salaire: ${field.salary}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Compétences recherchées
            </Typography>
            {careerPrediction.skills.map((skill, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography variant="body2">{skill.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{skill.importance}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={skill.importance} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={skill.importance > 90 ? "success" : skill.importance > 80 ? "primary" : "secondary"} 
                />
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Prochaines étapes recommandées
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                backgroundColor: "primary.light", 
                color: "primary.contrastText",
                borderRadius: 2,
                boxShadow: 2
              }}
            >
              <List sx={{ p: 0 }}>
                {careerPrediction.nextSteps.map((step, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <PlayArrow sx={{ color: "primary.contrastText" }} />
                    </ListItemIcon>
                    <ListItemText primary={step} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Cours recommandés - Sans popup ni bouton */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          <MenuBook sx={{ mr: 1, verticalAlign: "middle" }} />
          Cours recommandés
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {resources.courses.map((course, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                variant="outlined" 
                sx={{ 
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)"
                  }
                }}
              >
                <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle1">{course.title}</Typography>
                    <Chip size="small" label={course.type} color="primary" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {course.provider} | {course.difficulty} | {course.duration}
                  </Typography>
                  <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
                    <Rating value={course.rating} precision={0.5} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {course.rating}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default StudentGuidance;