import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const Analyse = () => {
  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // State for data
  const [alerts, setAlerts] = useState([]);
  const [classment, setClassment] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes/');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch subjects based on class and semester
  const fetchSubjects = async (classId, semester) => {
    try {
      const response = await fetch(`/api/matieres/by_class_semester/?classe_id=${classId}&semestre=${semester}`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      console.log('Fetched Subjects:', data); // Debugging statement
      setSubjects(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch alerts, classment, predictions, and recommendations
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch alerts
      const alertsResponse = await fetch('/api/generate-alerts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          class_id: selectedClass,
          semester: selectedSemester,
          subject_id: selectedSubject,
        }),
      });
      if (!alertsResponse.ok) throw new Error('Failed to fetch alerts');
      const alertsData = await alertsResponse.json();
      setAlerts(alertsData.alerts || []);

      // Fetch classment
      const classmentResponse = await fetch('/api/classify-students/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          class_id: selectedClass,
          semester: selectedSemester,
          subject_id: selectedSubject,
        }),
      });
      if (!classmentResponse.ok) throw new Error('Failed to fetch classment');
      const classmentData = await classmentResponse.json();
      setClassment(classmentData.results || []);

      // Fetch predictions
      const predictionsResponse = await fetch('/api/predict-performance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          class_id: selectedClass,
          semester: selectedSemester,
          subject_id: selectedSubject,
        }),
      });
      if (!predictionsResponse.ok) throw new Error('Failed to fetch predictions');
      const predictionsData = await predictionsResponse.json();
      setPredictions(predictionsData.predictions || []);

      // Fetch recommendations only if semester is 4
      if (parseInt(selectedSemester) === 4) {
        const recommendationsResponse = await fetch('/api/generate-recommendations/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            class_id: selectedClass,
            semester: selectedSemester,
            subject_id: selectedSubject,
          }),
        });
        if (!recommendationsResponse.ok) throw new Error('Failed to fetch recommendations');
        const recommendationsData = await recommendationsResponse.json();
        setRecommendations(recommendationsData.recommendations || []);
      } else {
        setRecommendations([]); // Clear recommendations if semester is not 4
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filter, value) => {
    switch (filter) {
      case 'class':
        setSelectedClass(value);
        setSelectedSubject(''); // Reset subject when class changes
        if (selectedSemester) {
          fetchSubjects(value, selectedSemester);
        }
        break;
      case 'semester':
        setSelectedSemester(value);
        setSelectedSubject(''); // Reset subject when semester changes
        if (selectedClass) {
          fetchSubjects(selectedClass, value);
        }
        break;
      case 'subject':
        setSelectedSubject(value);
        break;
      default:
        break;
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    if (selectedClass && selectedSemester && selectedSubject) {
      fetchData();
    }
  }, [selectedClass, selectedSemester, selectedSubject]);

  // Columns for DataGrid
  const alertsColumns = [
    { field: 'student_name', headerName: 'Student Name', width: 200 },
    { field: 'message', headerName: 'Message', width: 400 },
  ];

  const classmentColumns = [
    { field: 'student_name', headerName: 'Student Name', width: 200 },
    { field: 'performance_category', headerName: 'Performance Category', width: 200 },
  ];

  const predictionsColumns = [
    { field: 'student_name', headerName: 'Student Name', width: 200 },
    { field: 'predicted_score', headerName: 'Predicted Score', width: 200 },
  ];

  const recommendationsColumns = [
    { field: 'student_name', headerName: 'Student Name', width: 200 },
    { field: 'message', headerName: 'Recommendation', width: 400 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Student Analysis
      </Typography>

      {/* Filters */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Class</InputLabel>
            <Select
              value={selectedClass}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              label="Class"
            >
              {classes.map((classe) => (
                <MenuItem key={classe.id} value={classe.id}>
                  {classe.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Semester</InputLabel>
            <Select
              value={selectedSemester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              label="Semester"
            >
              <MenuItem value={2}>Semester 2</MenuItem>
              <MenuItem value={3}>Semester 3</MenuItem>
              <MenuItem value={4}>Semester 4</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Subject</InputLabel>
            <Select
              value={selectedSubject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              label="Subject"
              disabled={!selectedClass || !selectedSemester}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {/* Alerts */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Alerts" />
        <Divider />
        <CardContent>
          <DataGrid
            rows={alerts}
            columns={alertsColumns}
            getRowId={(row) => row.student_id}
            paginationModel={{ pageSize: 5, page: 0 }}
            pageSizeOptions={[5]}
            autoHeight
          />
        </CardContent>
      </Card>

      {/* Classment */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Classment" />
        <Divider />
        <CardContent>
          <DataGrid
            rows={classment}
            columns={classmentColumns}
            getRowId={(row) => row.student_id}
            paginationModel={{ pageSize: 5, page: 0 }}
            pageSizeOptions={[5]}
            autoHeight
          />
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Predictions" />
        <Divider />
        <CardContent>
          <DataGrid
            rows={predictions}
            columns={predictionsColumns}
            getRowId={(row) => row.student_id}
            paginationModel={{ pageSize: 5, page: 0 }}
            pageSizeOptions={[5]}
            autoHeight
          />
        </CardContent>
      </Card>

      {/* Recommendations - Only show if Semester 4 is selected */}
      {parseInt(selectedSemester) === 4 && (
        <Card sx={{ mb: 4 }}>
          <CardHeader title="Recommendations" />
          <Divider />
          <CardContent>
            <DataGrid
              rows={recommendations}
              columns={recommendationsColumns}
              getRowId={(row) => row.student_id}
              paginationModel={{ pageSize: 5, page: 0 }}
              pageSizeOptions={[5]}
              autoHeight
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Analyse;