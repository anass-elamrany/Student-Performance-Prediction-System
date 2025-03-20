import { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
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
  ResponsiveContainer 
} from 'recharts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';

const AdminDashboard = () => {
  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for statistics
  const [numStudents, setNumStudents] = useState(0);
  const [numTeachers, setNumTeachers] = useState(0);
  const [numMatieres, setNumMatieres] = useState(0);
  const [numClasses, setNumClasses] = useState(0); // Add this line

  // State for charts
  const [performanceData, setPerformanceData] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [subjectsPerformance, setSubjectsPerformance] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  // Helper function to refresh the JWT token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await fetch('/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access); // Store the new access token
        return data.access;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
  
    let token = localStorage.getItem('accessToken');
    console.log('Token:', token); // Log the token
  
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
      console.log('Students Data:', studentsData); // Log the response data
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
      console.log('Teachers Data:', teachersData); // Log the response data
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
      console.log('Matieres Data:', matieresData); // Log the response data
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
      console.log('Classes Data:', classesData); // Log the response data
      setNumClasses(classesData.length);
  
    } catch (err) {
      console.error('Error fetching data:', err); // Log the error
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de Bord - Statistiques Académiques
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vue d'ensemble des performances des étudiants
        </Typography>
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

      {/* Summary Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon color="primary" fontSize="large" />
              </Box>
              <Typography variant="h5" component="div">
                {numStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nombre d'étudiants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <SchoolIcon color="success" fontSize="large" />
              </Box>
              <Typography variant="h5" component="div">
                {numTeachers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nombre d'enseignants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="info" fontSize="large" />
              </Box>
              <Typography variant="h5" component="div">
                {numMatieres}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nombre de matières
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="error" fontSize="large" />
              </Box>
              <Typography variant="h5" component="div">
                {numClasses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nombre de classes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts */}
      <Grid container spacing={4}>
        {/* Performance Trend */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Évolution des Performances" />
            <Divider />
            <CardContent>
              {performanceData.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[60, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="average" stroke="#2196F3" name="Moyenne" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  Les données ne sont pas disponibles. Veuillez entrer les notes des étudiants.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Rate */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Taux de Présence" />
            <Divider />
            <CardContent>
              {attendanceData.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[80, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="rate" stroke="#4CAF50" name="Taux de présence (%)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  Les données ne sont pas disponibles. Veuillez entrer les notes des étudiants.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Répartition par Catégorie" />
            <Divider />
            <CardContent>
              {categoryDistribution.length > 0 ? (
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  Les données ne sont pas disponibles. Veuillez entrer les notes des étudiants.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Subject Success Rate */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Taux de Réussite par Matière" />
            <Divider />
            <CardContent>
              {subjectsPerformance.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectsPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="success_rate" fill="#673AB7" name="Taux de réussite (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  Les données ne sont pas disponibles. Veuillez entrer les notes des étudiants.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;