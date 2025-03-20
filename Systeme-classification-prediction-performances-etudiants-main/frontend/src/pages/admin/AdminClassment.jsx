import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const STATUS_COLORS = {
  'Bon performeur': '#4CAF50',
  'Moyenne performance': '#FFC107',
  'À risque': '#F44336',
};

const AdminClassment = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classificationResults, setClassificationResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch classes and subjects from the backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch classes
        const classesResponse = await fetch('/api/classes/');
        const classesData = await classesResponse.json();
        setClasses(classesData);

        // Fetch subjects
        const subjectsResponse = await fetch('/api/matieres/');
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbarMessage("Erreur lors du chargement des données.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle semester change
  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
    setSelectedSubject(''); // Reset subject when semester changes
  };

  // Handle subject change
  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  // Classify students
  const classifyStudents = async () => {
    if (!selectedClass || !selectedSemester || !selectedSubject) {
      setSnackbarMessage("Veuillez sélectionner une classe, un semestre et une matière.");
      setSnackbarOpen(true);
      return;
    }

    // Exclude Semester 1
    if (parseInt(selectedSemester) === 1) {
      setSnackbarMessage("La classification n'est pas disponible pour le semestre 1.");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/classify-students/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class_id: selectedClass,
          semester: selectedSemester,
          subject_id: selectedSubject,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }

      const result = await response.json();
      setClassificationResults(result.results);
      setSnackbarMessage("Classification terminée avec succès.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error classifying students:', error);
      setSnackbarMessage("Erreur lors de la classification.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Classification des Étudiants
      </Typography>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Classe</InputLabel>
              <Select
                value={selectedClass}
                label="Classe"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <MenuItem value="">Sélectionner une classe</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Semestre</InputLabel>
              <Select
                value={selectedSemester}
                label="Semestre"
                onChange={handleSemesterChange}
              >
                <MenuItem value="">Sélectionner un semestre</MenuItem>
                <MenuItem value={2}>Semestre 2</MenuItem>
                <MenuItem value={3}>Semestre 3</MenuItem>
                <MenuItem value={4}>Semestre 4</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Matière</InputLabel>
              <Select
                value={selectedSubject}
                label="Matière"
                onChange={handleSubjectChange}
                disabled={!selectedSemester}
              >
                <MenuItem value="">Sélectionner une matière</MenuItem>
                {subjects
                  .filter((subject) => subject.semestre === parseInt(selectedSemester))
                  .map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>{subject.nom}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Classify Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={classifyStudents}
        disabled={loading || !selectedClass || !selectedSemester || !selectedSubject}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Classer les Étudiants"}
      </Button>

      {/* Results */}
      {classificationResults.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Résultats de la Classification
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Étudiant</TableCell>
                  <TableCell align="center">Catégorie</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classificationResults.map((result) => (
                  <TableRow key={result.student_id}>
                    <TableCell>{result.student_name}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={result.performance_category}
                        sx={{
                          backgroundColor: STATUS_COLORS[result.performance_category],
                          color: 'white',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: '100%', display: 'flex', alignItems: 'center' }}
          icon={<CheckCircleIcon fontSize="inherit" />}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminClassment;