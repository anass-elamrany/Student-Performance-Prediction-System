import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  // State for statistics
  const [numStudents, setNumStudents] = useState(0);
  const [numTeachers, setNumTeachers] = useState(0);
  const [numMatieres, setNumMatieres] = useState(0);
  const [numClasses, setNumClasses] = useState(0);

  // State for charts
  const [subjectsPerformance, setSubjectsPerformance] = useState([]);

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
  
    const token = localStorage.getItem('accessToken');
  
    try {
      // Fetch number of students
      const studentsResponse = await fetch('/api/students/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!studentsResponse.ok) {
        const errorData = await studentsResponse.json();
        throw new Error(errorData.error || 'Failed to fetch students data');
      }
  
      const studentsData = await studentsResponse.json();
      setNumStudents(studentsData.length);
  
      // Fetch number of teachers
      const teachersResponse = await fetch('/api/enseignants/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!teachersResponse.ok) {
        const errorData = await teachersResponse.json();
        throw new Error(errorData.error || 'Failed to fetch teachers data');
      }
  
      const teachersData = await teachersResponse.json();
      setNumTeachers(teachersData.length);
  
      // Fetch number of matières
      const matieresResponse = await fetch('/api/matieres/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!matieresResponse.ok) {
        const errorData = await matieresResponse.json();
        throw new Error(errorData.error || 'Failed to fetch matières data');
      }
  
      const matieresData = await matieresResponse.json();
      setNumMatieres(matieresData.length);
  
      // Fetch number of classes
      const classesResponse = await fetch('/api/classes/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!classesResponse.ok) {
        const errorData = await classesResponse.json();
        throw new Error(errorData.error || 'Failed to fetch classes data');
      }
  
      const classesData = await classesResponse.json();
      setNumClasses(classesData.length);
  
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    }
  };

  // Fetch chart data
  const fetchChartData = async () => {
    const token = localStorage.getItem('accessToken');
    
    try {
      // Fetch subject success rate
      const subjectsResponse = await fetch('/api/charts/subject-success-rate/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subjectsData = await subjectsResponse.json();
      setSubjectsPerformance(subjectsData);

    } catch (error) {
      console.error('Error fetching chart data:', error);
      setError('Impossible de charger les données des graphiques');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    fetchChartData();
  }, []);

  // Summary stats
  const summaryStats = [
    { 
      title: 'Nombre d\'étudiants', 
      value: numStudents, 
      icon: <AssessmentIcon fontSize="large" />, 
      color: theme.palette.primary.main,
      description: 'Total des étudiants inscrits'
    },
    { 
      title: 'Nombre d\'enseignants', 
      value: numTeachers, 
      icon: <SchoolIcon fontSize="large" />, 
      color: theme.palette.success.main || '#4caf50',
      description: 'Total des enseignants'
    },
    { 
      title: 'Nombre de matières', 
      value: numMatieres, 
      icon: <TrendingUpIcon fontSize="large" />, 
      color: theme.palette.info.main || '#2196f3',
      description: 'Matières disponibles'
    },
    { 
      title: 'Nombre de classes', 
      value: numClasses, 
      icon: <WarningIcon fontSize="large" />, 
      color: theme.palette.warning.main || '#ff9800',
      description: 'Classes existantes'
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Tableau de Bord Administrateur
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Vue d'ensemble des statistiques académiques
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={2}
              sx={{ 
                height: 140, 
                borderLeft: `4px solid ${stat.color}`,
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {stat.title}
                </Typography>
                <Typography variant="h3" sx={{ mt: 2, fontWeight: "bold", color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Subject Success Rate */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="medium">
                  Taux de Réussite par Matière
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 320 }}>
                {subjectsPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectsPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis 
                        dataKey="subject" 
                        tick={{ fill: theme.palette.text.secondary }} 
                        stroke={theme.palette.divider}
                      />
                      <YAxis 
                        domain={[0, 20]} 
                        tick={{ fill: theme.palette.text.secondary }} 
                        stroke={theme.palette.divider}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper,
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.primary
                        }}
                      />
                      <Bar dataKey="success_rate" fill={theme.palette.primary.main} name="Moyenne" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    color: theme.palette.text.secondary
                  }}>
                    Aucune donnée disponible
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;