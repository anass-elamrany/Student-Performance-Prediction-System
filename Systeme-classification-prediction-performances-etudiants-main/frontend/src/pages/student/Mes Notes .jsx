import  { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Book, Timeline, FilterList } from "@mui/icons-material";

const StudentNotes = () => {
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [filteredGrades, setFilteredGrades] = useState(null);

  useEffect(() => {
    // Simuler un appel API pour récupérer les notes
    const fetchGrades = async () => {
      try {
        // Remplacer par un vrai appel API
        setTimeout(() => {
          const data = {
            semesters: ["Semestre 1", "Semestre 2"],
            courses: [
              {
                id: 1,
                name: "Algorithmique",
                semester: "Semestre 1",
                grades: [
                  { title: "Contrôle 1", value: 12.5, coefficient: 0.3, date: "15/11/2024" },
                  { title: "TP", value: 14, coefficient: 0.2, date: "30/11/2024" },
                  { title: "Examen Final", value: 13.5, coefficient: 0.5, date: "20/12/2024" },
                ],
                average: 13.25,
                classAverage: 12.8,
                professorName: "Dr. Martin",
              },
              {
                id: 2,
                name: "Bases de Données",
                semester: "Semestre 1",
                grades: [
                  { title: "Contrôle 1", value: 15.5, coefficient: 0.25, date: "22/11/2024" },
                  { title: "Projet", value: 17, coefficient: 0.25, date: "05/12/2024" },
                  { title: "Examen Final", value: 16, coefficient: 0.5, date: "22/12/2024" },
                ],
                average: 16.13,
                classAverage: 14.2,
                professorName: "Prof. Dubois",
              },
              {
                id: 3,
                name: "Intelligence Artificielle",
                semester: "Semestre 2",
                grades: [
                  { title: "TP 1", value: 14.5, coefficient: 0.15, date: "20/01/2025" },
                  { title: "Projet de groupe", value: 16, coefficient: 0.35, date: "15/02/2025" },
                  { title: "Examen Partiel", value: 15, coefficient: 0.5, date: "01/03/2025" },
                ],
                average: 15.23,
                classAverage: 13.7,
                professorName: "Dr. Lefevre",
              },
              {
                id: 4,
                name: "Programmation Web",
                semester: "Semestre 2",
                grades: [
                  { title: "TP 1", value: 13, coefficient: 0.2, date: "25/01/2025" },
                  { title: "TP 2", value: 14.5, coefficient: 0.2, date: "15/02/2025" },
                  { title: "Projet", value: 15, coefficient: 0.3, date: "28/02/2025" },
                  { title: "Examen", value: 14, coefficient: 0.3, date: "05/03/2025" },
                ],
                average: 14.25,
                classAverage: 13.1,
                professorName: "Prof. Bernard",
              },
              {
                id: 5,
                name: "Architecture des Systèmes",
                semester: "Semestre 2",
                grades: [
                  { title: "Contrôle", value: 12, coefficient: 0.3, date: "10/02/2025" },
                  { title: "TP", value: 13, coefficient: 0.3, date: "25/02/2025" },
                  { title: "Examen", value: 12.5, coefficient: 0.4, date: "01/03/2025" },
                ],
                average: 12.5,
                classAverage: 12.9,
                professorName: "Dr. Thomas",
              },
            ],
            overall: {
              semesterAverages: [
                { semester: "Semestre 1", average: 14.69, classAverage: 13.5 },
                { semester: "Semestre 2", average: 13.99, classAverage: 13.2 },
              ],
              globalAverage: 14.27,
              globalClassAverage: 13.3,
              ranking: 15,
              totalStudents: 87,
            },
          };
          setGrades(data);
          setFilteredGrades(data.courses);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors de la récupération des notes:", error);
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  useEffect(() => {
    if (grades) {
      if (selectedSemester === "all") {
        setFilteredGrades(grades.courses);
      } else {
        setFilteredGrades(grades.courses.filter(course => course.semester === selectedSemester));
      }
    }
  }, [selectedSemester, grades]);

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  const getGradeColor = (grade) => {
    if (grade >= 16) return "success";
    if (grade >= 12) return "info";
    if (grade >= 10) return "warning";
    return "error";
  };

  const semesterAveragesData = grades.overall.semesterAverages.map(sem => ({
    name: sem.semester,
    "Votre moyenne": sem.average,
    "Moyenne de classe": sem.classAverage,
  }));

  const courseAveragesData = filteredGrades.map(course => ({
    name: course.name,
    "Votre moyenne": course.average,
    "Moyenne de classe": course.classAverage,
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <Book sx={{ mr: 1, verticalAlign: "middle" }} />
        Mes Notes
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Consultez vos notes et évaluations
      </Typography>

      {/* Résumé général */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: "flex", flexDirection: "column", height: 120, bgcolor: "primary.light", color: "white" }}>
            <Typography variant="subtitle2">Moyenne Générale</Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              {grades.overall.globalAverage.toFixed(2)}/20
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: "flex", flexDirection: "column", height: 120, bgcolor: "info.light", color: "white" }}>
            <Typography variant="subtitle2">Moyenne de la Promotion</Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              {grades.overall.globalClassAverage.toFixed(2)}/20
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: "flex", flexDirection: "column", height: 120, bgcolor: "success.light", color: "white" }}>
            <Typography variant="subtitle2">Classement</Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              {grades.overall.ranking}/{grades.overall.totalStudents}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: "flex", flexDirection: "column", height: 120, bgcolor: "warning.light", color: "white" }}>
            <Typography variant="subtitle2">Meilleure Matière</Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              {Math.max(...grades.courses.map(course => course.average)).toFixed(1)}/20
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Graphique des moyennes par semestre */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <Timeline sx={{ mr: 1, verticalAlign: "middle" }} />
          Moyennes par semestre
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={semesterAveragesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 20]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Votre moyenne" fill="#8884d8" />
            <Bar dataKey="Moyenne de classe" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Filtre par semestre */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">
          <FilterList sx={{ mr: 1, verticalAlign: "middle" }} />
          Détails des notes par cours
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Semestre</InputLabel>
          <Select
            value={selectedSemester}
            label="Semestre"
            onChange={handleSemesterChange}
          >
            <MenuItem value="all">Tous les semestres</MenuItem>
            {grades.semesters.map((semester) => (
              <MenuItem key={semester} value={semester}>
                {semester}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Graphique des moyennes par cours */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Comparaison par matière
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={courseAveragesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 20]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Votre moyenne" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Moyenne de classe" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Liste des cours et notes détaillées */}
      <Grid container spacing={3}>
        {filteredGrades.map(course => (
          <Grid item xs={12} key={course.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">{course.name}</Typography>
                  <Chip 
                    label={`Moyenne: ${course.average.toFixed(2)}/20`} 
                    color={getGradeColor(course.average)} 
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {course.semester} | Prof: {course.professorName} | Moyenne de classe: {course.classAverage.toFixed(2)}/20
                </Typography>
                <Divider sx={{ my: 2 }} />
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Évaluation</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Coefficient</TableCell>
                        <TableCell>Note</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {course.grades.map((grade, index) => (
                        <TableRow key={index}>
                          <TableCell>{grade.title}</TableCell>
                          <TableCell>{grade.date}</TableCell>
                          <TableCell>{grade.coefficient}</TableCell>
                          <TableCell>
                            <Chip 
                              label={`${grade.value}/20`} 
                              size="small" 
                              color={getGradeColor(grade.value)} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StudentNotes;