import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import RecommendIcon from '@mui/icons-material/Recommend';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const AdminPerformance = () => {
  // State for filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  // Pop-up notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Data states
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classificationResults, setClassificationResults] = useState([]);
  const [chartData, setChartData] = useState([]);

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

  // Function to classify students by class and subject
  const classifyStudentsByClassAndSubject = async () => {
    if (selectedClass === 'all' || selectedSubject === 'all') {
      setSnackbarMessage("Veuillez sélectionner une classe et une matière.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/classify-students-by-class-and-subject/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class_id: selectedClass,
          subject_id: selectedSubject,
        }),
      });
      const result = await response.json();
      setClassificationResults(result.results);

      // Prepare data for the chart
      const categories = {};
      result.results.forEach((item) => {
        if (categories[item.performance_category]) {
          categories[item.performance_category] += 1;
        } else {
          categories[item.performance_category] = 1;
        }
      });

      const chartData = Object.keys(categories).map((key) => ({
        name: key,
        value: categories[key],
      }));
      setChartData(chartData);

      setSnackbarMessage("Classification terminée avec succès.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error classifying students:', error);
      setSnackbarMessage("Erreur lors de la classification.");
      setSnackbarOpen(true);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Performances des Étudiants
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyse et prédiction des performances académiques
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Classe</InputLabel>
              <Select
                value={selectedClass}
                label="Classe"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <MenuItem value="all">Toutes les classes</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Matière</InputLabel>
              <Select
                value={selectedSubject}
                label="Matière"
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <MenuItem value="all">Toutes les matières</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>{subject.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            onClick={classifyStudentsByClassAndSubject}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Classer les Étudiants"}
          </Button>
        </Grid>
      </Grid>
      
      {/* Results */}
      {classificationResults.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Résultats de la Classification
          </Typography>
          <Grid container spacing={2}>
            {classificationResults.map((result) => (
              <Grid item xs={12} sm={6} md={4} key={result.student_id}>
                <Card>
                  <CardContent>
                    <Typography variant="body1">
                      {result.student_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Catégorie: {result.performance_category}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {/* Chart */}
      {chartData.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Répartition des Catégories de Performance
          </Typography>
          <PieChart width={400} height={400}>
            <Pie
              data={chartData}
              cx={200}
              cy={200}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Paper>
      )}
      
      {/* Success Notification Snackbar */}
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

export default AdminPerformance;