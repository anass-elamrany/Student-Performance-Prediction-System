import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchWithTokenRefresh, checkAuthStatus, getUserRole } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const TeacherAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const navigate = useNavigate();

  // Check authentication and user role on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const user = await checkAuthStatus();
      if (!user || getUserRole() !== 'teacher') {
        navigate('/login'); // Redirect to login if not authenticated or not a teacher
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch matières on component mount
  useEffect(() => {
    const fetchMatieres = async () => {
      setLoading(true);
      try {
        const response = await fetchWithTokenRefresh('/api/teacher/matieres/');
        const data = await response.json();
        if (data.success) {
          setMatieres(data.matieres);
          if (data.matieres.length > 0) {
            setSelectedMatiere(data.matieres[0].id); // Set the first matiere as default
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatieres();
  }, []);

  // Fetch data when selectedMatiere changes
  useEffect(() => {
    if (selectedMatiere) {
      fetchData(selectedMatiere);
    }
  }, [selectedMatiere]);

  // Fetch alerts, classifications, predictions, and recommendations
  const fetchData = async (matiereId) => {
    setLoading(true);
    setError(null);
  
    try {
      // Fetch alerts
      const alertsResponse = await fetchWithTokenRefresh(`/api/teacher/alerts/?matiere_id=${matiereId}`);
      const alertsData = await alertsResponse.json();
      if (alertsData.success) {
        setAlerts(
          alertsData.alerts.map((alert) => ({
            ...alert,
            id: alert.student_id || alert.id,
            student_name: alert.student_name || "Unknown Student",  // Fallback for missing names
          }))
        );
      }
  
      // Fetch classifications
      const classificationsResponse = await fetchWithTokenRefresh(`/api/teacher/classifications/?matiere_id=${matiereId}`);
      const classificationsData = await classificationsResponse.json();
      if (classificationsData.success) {
        setClassifications(
          classificationsData.classifications.map((classification) => ({
            ...classification,
            id: classification.student_id || classification.id,
            student_name: classification.student_name || "Unknown Student",  // Fallback for missing names
          }))
        );
      }
  
      // Fetch predictions
      const predictionsResponse = await fetchWithTokenRefresh(`/api/teacher/predictions/?matiere_id=${matiereId}`);
      const predictionsData = await predictionsResponse.json();
      if (predictionsData.success) {
        setPredictions(
          predictionsData.predictions.map((prediction) => ({
            ...prediction,
            id: prediction.student_id || prediction.id,
            student_name: prediction.student_name || "Unknown Student",  // Fallback for missing names
          }))
        );
      }
  
      // Fetch recommendations
      const recommendationsResponse = await fetchWithTokenRefresh(`/api/teacher/recommendations/?matiere_id=${matiereId}`);
      const recommendationsData = await recommendationsResponse.json();
      if (recommendationsData.success) {
        setRecommendations(
          recommendationsData.recommendations.map((recommendation) => ({
            ...recommendation,
            id: recommendation.student_id || recommendation.id,
            student_name: recommendation.student_name || "Unknown Student",  // Fallback for missing names
          }))
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Columns for DataGrid
  const alertsColumns = [
    { field: 'student_name', headerName: 'Student Name', width: 200 },
    { field: 'message', headerName: 'Message', width: 400 },
  ];

  const classificationsColumns = [
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
        Teacher Analysis
      </Typography>

      {/* Matière Filter */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Matière</InputLabel>
            <Select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              label="Matière"
            >
              {matieres.map((matiere) => (
                <MenuItem key={matiere.id} value={matiere.id}>
                  {matiere.nom}
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
            getRowId={(row) => row.id}
            paginationModel={{ pageSize: 5, page: 0 }}
            pageSizeOptions={[5]}
            autoHeight
          />
        </CardContent>
      </Card>

      {/* Classifications */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Classifications" />
        <Divider />
        <CardContent>
          <DataGrid
            rows={classifications}
            columns={classificationsColumns}
            getRowId={(row) => row.id}
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
            getRowId={(row) => row.id}
            paginationModel={{ pageSize: 5, page: 0 }}
            pageSizeOptions={[5]}
            autoHeight
          />
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Recommendations" />
        <Divider />
        <CardContent>
          <DataGrid
            rows={recommendations}
            columns={recommendationsColumns}
            getRowId={(row) => row.id}
            paginationModel={{ pageSize: 5, page: 0 }}
            pageSizeOptions={[5]}
            autoHeight
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeacherAnalysis;