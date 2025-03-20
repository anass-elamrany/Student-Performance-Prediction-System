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
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const STATUS_COLORS = {
  'À risque': '#F44336',
  'Moyenne performance': '#FFC107',
  'Bon performeur': '#4CAF50',
};

const AdminAlerts = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [alerts, setAlerts] = useState([]);
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

  // Generate alerts for at-risk students
  const generateAlerts = async () => {
    if (!selectedClass || !selectedSemester || !selectedSubject) {
      setSnackbarMessage("Veuillez sélectionner une classe, un semestre et une matière.");
      setSnackbarOpen(true);
      return;
    }

    // Exclude Semester 1
    if (parseInt(selectedSemester) === 1) {
      setSnackbarMessage("Les alertes ne sont pas disponibles pour le semestre 1.");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-alerts/', {
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
      setAlerts(result.alerts);
      setSnackbarMessage("Alertes générées avec succès.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error generating alerts:', error);
      setSnackbarMessage("Erreur lors de la génération des alertes.");
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
        Système d'Alerte
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

      {/* Generate Alerts Button */}
      <Button
        variant="contained"
        color="warning"
        onClick={generateAlerts}
        disabled={loading || !selectedClass || !selectedSemester || !selectedSubject}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Générer des Alertes"}
      </Button>

      {/* Results */}
      {alerts.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Alertes Générées
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Étudiant</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell align="center">Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.student_id}>
                    <TableCell>{alert.student_name}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={alert.performance_category}
                        sx={{
                          backgroundColor: STATUS_COLORS[alert.performance_category],
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WarningIcon sx={{ color: '#F44336', mr: 1 }} />
                        {alert.message}
                      </Box>
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

export default AdminAlerts;