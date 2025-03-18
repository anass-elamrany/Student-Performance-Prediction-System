import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
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
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Visibility, Warning, EmojiEvents, Recommend } from "@mui/icons-material";

// Données fictives pour la démo
const mockClasses = [
  { id: 1, name: "Mathématiques Avancées" },
  { id: 2, name: "Programmation Java" },
  { id: 3, name: "Base de Données SQL" },
];

const mockPerformanceData = {
  overallStats: {
    averageGrade: 14.3,
    attendanceRate: 88,
    atRiskCount: 3,
    topPerformersCount: 5,
  },
  distributionData: [
    { name: "0-5", value: 1 },
    { name: "6-10", value: 5 },
    { name: "11-15", value: 12 },
    { name: "16-20", value: 7 },
  ],
  progressData: [
    { month: "Sept", average: 13.2 },
    { month: "Oct", average: 13.7 },
    { month: "Nov", average: 14.1 },
    { month: "Dec", average: 14.3 },
    { month: "Jan", average: 14.5 },
    { month: "Fév", average: 14.8 },
  ],
  attendanceData: [
    { month: "Sept", rate: 92 },
    { month: "Oct", rate: 90 },
    { month: "Nov", rate: 89 },
    { month: "Dec", rate: 87 },
    { month: "Jan", rate: 86 },
    { month: "Fév", rate: 88 },
  ],
};

const mockStudents = [
  {
    id: 1,
    name: "Ahmed Bensouda",
    averageGrade: 17.5,
    attendance: 95,
    status: "Excellent",
    risk: "low",
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
    recommendations: [
      { type: "path", content: "Orientation vers des cours optionnels avancés" },
    ],
  },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const STATUS_COLORS = {
  low: "#4CAF50",
  medium: "#FFC107",
  high: "#F44336",
};

const TeacherAnalyse = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedClass, setSelectedClass] = useState("");
  const [performanceData, setPerformanceData] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setPerformanceData(mockPerformanceData);
      setStudents(mockStudents);
      // @ts-ignore
      setSelectedClass(mockClasses[0].id);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
    // Dans une implémentation réelle, on chargerait ici les données 
    // spécifiques à la classe sélectionnée depuis l'API
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

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="class-select-label">Sélectionner une classe</InputLabel>
        <Select
          labelId="class-select-label"
          id="class-select"
          value={selectedClass}
          label="Sélectionner une classe"
          onChange={handleClassChange}
        >
          {mockClasses.map((cls) => (
            <MenuItem key={cls.id} value={cls.id}>
              {cls.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper sx={{ width: "100%", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Vue d'ensemble" />
          <Tab label="Étudiants" />
          <Tab label="Recommandations" />
        </Tabs>
      </Paper>

      {/* Onglet Vue d'ensemble */}
      {tabValue === 0 && (
        <Box>
          <Grid container spacing={3}>
            {/* Statistiques globales */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Statistiques globales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Moyenne générale
                        </Typography>
                        <Typography variant="h4">
                          {performanceData.overallStats.averageGrade}/20
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Taux de présence
                        </Typography>
                        <Typography variant="h4">
                          {performanceData.overallStats.attendanceRate}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Étudiants à risque
                        </Typography>
                        <Typography variant="h4" sx={{ color: "#F44336" }}>
                          {performanceData.overallStats.atRiskCount}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Excellents étudiants
                        </Typography>
                        <Typography variant="h4" sx={{ color: "#4CAF50" }}>
                          {performanceData.overallStats.topPerformersCount}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Graphiques */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Distribution des notes
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceData.distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {performanceData.distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Évolution de la moyenne
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={performanceData.progressData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 20]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Taux de présence par mois
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData.attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" name="Taux de présence (%)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Onglet Étudiants */}
      {tabValue === 1 && (
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
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
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
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<Visibility />}
                          sx={{ mr: 1 }}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Onglet Recommandations */}
      {tabValue === 2 && (
        <Box>
          <Grid container spacing={3}>
            {students.map((student) => (
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
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default TeacherAnalyse;