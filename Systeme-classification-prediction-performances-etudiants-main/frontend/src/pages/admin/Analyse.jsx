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
  Snackbar,
  Button,
} from "@mui/material";
import { Warning, Recommend, CheckCircle as CheckCircleIcon } from "@mui/icons-material";

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
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Fetch classes, subjects, and students from the backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch classes
        const classesResponse = await fetch("/api/classes/");
        const classesData = await classesResponse.json();
        setClasses(classesData);

        // Fetch subjects
        const subjectsResponse = await fetch("/api/subjects/");
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData);

        // Fetch students with their alerts and recommendations
        const studentsResponse = await fetch("/api/students-with-alerts-recommendations/");
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbarMessage("Erreur lors du chargement des données.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter students based on selected class and subject
  useEffect(() => {
    let filtered = [...students];

    if (selectedClass) {
      filtered = filtered.filter((student) => student.classId === parseInt(selectedClass));
    }

    if (selectedSubject) {
      filtered = filtered.filter((student) => student.subjectId === parseInt(selectedSubject));
    }

    setFilteredStudents(filtered);
  }, [selectedClass, selectedSubject, students]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle class change
  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  // Handle subject change
  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  // Get status color
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

  // Get risk color
  const getRiskColor = (risk) => {
    return STATUS_COLORS[risk] || "#757575";
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Function to predict student performance
  const predictStudentPerformance = async (studentId) => {
    try {
      const response = await fetch("/api/predict-performance/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          etudiant_id: studentId,
        }),
      });
      const result = await response.json();
      setSnackbarMessage(`Note prédite : ${result.predicted_score}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error predicting performance:", error);
      setSnackbarMessage("Erreur lors de la prédiction.");
      setSnackbarOpen(true);
    }
  };

  // Function to classify student performance
  const classifyStudentPerformance = async (studentId) => {
    try {
      const response = await fetch("/api/classify-student/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          etudiant_id: studentId,
        }),
      });
      const result = await response.json();
      setSnackbarMessage(`Catégorie de performance : ${result.performance_category}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error classifying student:", error);
      setSnackbarMessage("Erreur lors de la classification.");
      setSnackbarOpen(true);
    }
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

      {/* Filters */}
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
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.nom}
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
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Tabs */}
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
          <Tab label="Alertes" />
        </Tabs>
      </Paper>

      {/* Students Tab */}
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
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell component="th" scope="row">
                          {student.nom}
                        </TableCell>
                        <TableCell align="center">{student.moyenne}/20</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box sx={{ width: "100%", mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={student.presence}
                                sx={{
                                  height: 10,
                                  borderRadius: 5,
                                  backgroundColor: "#e0e0e0",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor:
                                      student.presence > 80
                                        ? "#4CAF50"
                                        : student.presence > 60
                                        ? "#FFC107"
                                        : "#F44336",
                                  },
                                }}
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="textSecondary">
                                {`${student.presence}%`}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={student.statut}
                            sx={{
                              backgroundColor: getStatusColor(student.statut),
                              color: "white",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              student.risque === "low"
                                ? "Faible"
                                : student.risque === "medium"
                                ? "Moyen"
                                : "Élevé"
                            }
                            sx={{
                              backgroundColor: getRiskColor(student.risque),
                              color: "white",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            onClick={() => predictStudentPerformance(student.id)}
                          >
                            Prédire
                          </Button>
                          <Button
                            variant="outlined"
                            sx={{ ml: 1 }}
                            onClick={() => classifyStudentPerformance(student.id)}
                          >
                            Classer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
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

      {/* Recommendations Tab */}
      {tabValue === 1 && (
        <Box>
          <Grid container spacing={3}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <Grid item xs={12} key={student.id}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6">{student.nom}</Typography>
                      <Chip
                        label={student.statut}
                        sx={{
                          backgroundColor: getStatusColor(student.statut),
                          color: "white",
                        }}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {student.risque === "high" && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">
                          Cet étudiant est identifié comme étant à risque élevé
                        </Typography>
                      </Alert>
                    )}

                    {student.recommandations && student.recommandations.length > 0 ? (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Recommandations:
                        </Typography>
                        {student.recommandations.map((rec, index) => (
                          <Card key={index} sx={{ mb: 1, backgroundColor: rec.type === "course" ? "#E3F2FD" : "#E8F5E9" }}>
                            <CardContent>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                {rec.type === "course" ? (
                                  <Warning sx={{ mr: 1, color: "#1976D2" }} />
                                ) : (
                                  <Recommend sx={{ mr: 1, color: "#4CAF50" }} />
                                )}
                                <Typography>{rec.contenu}</Typography>
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

      {/* Alerts Tab */}
      {tabValue === 2 && (
        <Box>
          <Grid container spacing={3}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <Grid item xs={12} key={student.id}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6">{student.nom}</Typography>
                      <Chip
                        label={student.statut}
                        sx={{
                          backgroundColor: getStatusColor(student.statut),
                          color: "white",
                        }}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {student.alertes && student.alertes.length > 0 ? (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Alertes:
                        </Typography>
                        {student.alertes.map((alerte, index) => (
                          <Card key={index} sx={{ mb: 1, backgroundColor: "#FFEBEE" }}>
                            <CardContent>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Warning sx={{ mr: 1, color: "#F44336" }} />
                                <Typography>{alerte.message}</Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </>
                    ) : (
                      <Typography variant="body1" color="textSecondary">
                        Aucune alerte pour cet étudiant actuellement.
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%", display: "flex", alignItems: "center" }}
          icon={<CheckCircleIcon fontSize="inherit" />}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAnalyse;