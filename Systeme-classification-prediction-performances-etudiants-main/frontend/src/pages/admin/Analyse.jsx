import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Chip,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { Warning, Recommend } from "@mui/icons-material";

// Données fictives pour la démo
const mockClasses = [
  { id: 1, name: "Mathématiques Avancées" },
  { id: 2, name: "Programmation Java" },
  { id: 3, name: "Base de Données SQL" },
];

const mockSubjects = [
  { id: 1, name: "Algorithmique" },
  { id: 2, name: "Structures de données" },
  { id: 3, name: "Statistiques" },
  { id: 4, name: "Base de données" },
];

const mockStudents = [
  {
    id: 1,
    name: "Ahmed Bensouda",
    averageGrade: 17.5,
    attendance: 95,
    status: "Excellent",
    risk: "low",
    classId: 1,
    subjectId: 2,
    recommendations: [
      { type: "course", content: "Proposer des projets avancés pour stimuler son potentiel" },
      { type: "path", content: "Encourager la participation aux compétitions de programmation" },
    ],
  },
  {
    id: 2,
    name: "Fatima Zahrae",
    averageGrade: 14.2,
    attendance: 88,
    status: "Bon",
    risk: "low",
    classId: 1,
    subjectId: 1,
    recommendations: [
      { type: "course", content: "Renforcer les bases en algorithmique" },
    ],
  },
  {
    id: 3,
    name: "Karim Alaoui",
    averageGrade: 9.5,
    attendance: 65,
    status: "En difficulté",
    risk: "high",
    classId: 2,
    subjectId: 3,
    recommendations: [
      { type: "course", content: "Sessions de rattrapage en programmation orientée objet" },
      { type: "path", content: "Envisager un tutorat personnalisé" },
    ],
  },
  {
    id: 4,
    name: "Samira Idrissi",
    averageGrade: 12.8,
    attendance: 82,
    status: "Moyen",
    risk: "medium",
    classId: 2,
    subjectId: 2,
    recommendations: [
      { type: "course", content: "Exercices supplémentaires sur les structures de données" },
      { type: "path", content: "Recommander des ressources d'auto-apprentissage" },
    ],
  },
  {
    id: 5,
    name: "Youssef Bennani",
    averageGrade: 16.2,
    attendance: 91,
    status: "Très bon",
    risk: "low",
    classId: 3,
    subjectId: 4,
    recommendations: [
      { type: "path", content: "Orientation vers des cours optionnels avancés" },
    ],
  },
];

const STATUS_COLORS = {
  low: "#4CAF50",
  medium: "#FFC107",
  high: "#F44336",
};

const AdminAnalyse = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
      setSelectedClass("");
      setSelectedSubject("");
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filtrer les étudiants en fonction de la classe et de la matière sélectionnées
    let filtered = [...students];
    
    if (selectedClass) {
      filtered = filtered.filter(student => student.classId === parseInt(selectedClass));
    }
    
    if (selectedSubject) {
      filtered = filtered.filter(student => student.subjectId === parseInt(selectedSubject));
    }
    
    setFilteredStudents(filtered);
  }, [selectedClass, selectedSubject, students]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Excellent":
      case "Très bon":
        return STATUS_COLORS.low;
      case "Bon":
      case "Moyen":
        return STATUS_COLORS.medium;
      case "En difficulté":
        return STATUS_COLORS.high;
      default:
        return "#757575";
    }
  };

  const getRiskColor = (risk) => {
    return STATUS_COLORS[risk] || "#757575";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Analyse des Performances
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="class-select-label">Sélectionner une classe</InputLabel>
            <Select
              labelId="class-select-label"
              id="class-select"
              value={selectedClass}
              label="Sélectionner une classe"
              onChange={handleClassChange}
            >
              <MenuItem value="">Toutes les classes</MenuItem>
              {mockClasses.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="subject-select-label">Sélectionner une matière</InputLabel>
            <Select
              labelId="subject-select-label"
              id="subject-select"
              value={selectedSubject}
              label="Sélectionner une matière"
              onChange={handleSubjectChange}
            >
              <MenuItem value="">Toutes les matières</MenuItem>
              {mockSubjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper sx={{ width: "100%", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Étudiants" />
          <Tab label="Recommandations" />
        </Tabs>
      </Paper>

      {/* Onglet Étudiants */}
      {tabValue === 0 && (
        <Box>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom de l'étudiant</TableCell>
                    <TableCell align="center">Moyenne</TableCell>
                    <TableCell align="center">Présence</TableCell>
                    <TableCell align="center">Statut</TableCell>
                    <TableCell align="center">Niveau de risque</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell component="th" scope="row">
                          {student.name}
                        </TableCell>
                        <TableCell align="center">{student.averageGrade}/20</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box sx={{ width: "100%", mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={student.attendance}
                                sx={{ 
                                  height: 10, 
                                  borderRadius: 5,
                                  backgroundColor: '#e0e0e0',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: student.attendance > 80 
                                      ? '#4CAF50' 
                                      : student.attendance > 60 
                                        ? '#FFC107' 
                                        : '#F44336'
                                  }
                                }}
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="textSecondary">{`${student.attendance}%`}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={student.status} 
                            sx={{ 
                              backgroundColor: getStatusColor(student.status),
                              color: 'white' 
                            }} 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={student.risk === "low" ? "Faible" : student.risk === "medium" ? "Moyen" : "Élevé"} 
                            sx={{ 
                              backgroundColor: getRiskColor(student.risk),
                              color: 'white' 
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Aucun étudiant ne correspond aux critères de filtre sélectionnés
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Onglet Recommandations */}
      {tabValue === 1 && (
        <Box>
          <Grid container spacing={3}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <Grid item xs={12} key={student.id}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6">{student.name}</Typography>
                      <Chip 
                        label={student.status} 
                        sx={{ 
                          backgroundColor: getStatusColor(student.status),
                          color: 'white' 
                        }} 
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    {student.risk === "high" && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">
                          Cet étudiant est identifié comme étant à risque élevé
                        </Typography>
                      </Alert>
                    )}
                    
                    {student.recommendations.length > 0 ? (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Recommandations:
                        </Typography>
                        {student.recommendations.map((rec, index) => (
                          <Card key={index} sx={{ mb: 1, backgroundColor: rec.type === "course" ? "#E3F2FD" : "#E8F5E9" }}>
                            <CardContent>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                {rec.type === "course" ? (
                                  <Warning sx={{ mr: 1, color: "#1976D2" }} />
                                ) : (
                                  <Recommend sx={{ mr: 1, color: "#4CAF50" }} />
                                )}
                                <Typography>
                                  {rec.content}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </>
                    ) : (
                      <Typography variant="body1" color="textSecondary">
                        Aucune recommandation pour cet étudiant actuellement.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="body1" align="center">
                    Aucun étudiant ne correspond aux critères de filtre sélectionnés
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AdminAnalyse;