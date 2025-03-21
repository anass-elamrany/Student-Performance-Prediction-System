import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import { checkAuthStatus, getUserRole, refreshToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [matiereStats, setMatiereStats] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [matieres, setMatieres] = useState([]);
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

  // Fetch matieres and data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch matieres taught by the teacher
        const matieresResponse = await fetchWithTokenRefresh('http://localhost:8000/api/teacher/matieres/');
        const matieresData = await matieresResponse.json();
        if (matieresData.success) {
          setMatieres(matieresData.matieres);
          if (matieresData.matieres.length > 0) {
            setSelectedMatiere(matieresData.matieres[0].id); // Set the first matiere as default
          }
        }
      } catch (error) {
        console.error('Error fetching matieres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch data when selectedMatiere changes
  useEffect(() => {
    if (selectedMatiere) {
      fetchMatiereData(selectedMatiere);
    }
  }, [selectedMatiere]);

  // Fetch statistics, grade distribution, and attendance for the selected matiere
  const fetchMatiereData = async (matiereId) => {
  setLoading(true);
  try {
    // Fetch teacher statistics for the selected matiere
    const statsResponse = await fetchWithTokenRefresh(
      `http://localhost:8000/api/teacher/statistics/?matiere_id=${matiereId}`
    );
    const statsData = await statsResponse.json();

    if (!statsResponse.ok) {
      throw new Error(statsData.message || 'Erreur lors de la récupération des statistiques');
    }

    if (statsData.success) {
      setMatiereStats(statsData.matiere_stats);
    }

    // Fetch grade distribution for the selected matiere
    const gradeResponse = await fetchWithTokenRefresh(
      `http://localhost:8000/api/teacher/grade-distribution/?matiere_id=${matiereId}`
    );
    const gradeData = await gradeResponse.json();

    if (!gradeResponse.ok) {
      throw new Error(gradeData.message || 'Erreur lors de la récupération de la distribution des notes');
    }

    if (gradeData.success) {
      setGradeDistribution(gradeData.grade_distribution);
    }

    // Fetch weekly attendance for the selected matiere
    const attendanceResponse = await fetchWithTokenRefresh(
      `http://localhost:8000/api/teacher/weekly-attendance/?matiere_id=${matiereId}`
    );
    const attendanceData = await attendanceResponse.json();

    if (!attendanceResponse.ok) {
      throw new Error(attendanceData.message || 'Erreur lors de la récupération des données de présence');
    }

    if (attendanceData.success) {
      setAttendanceData(attendanceData.attendance_data);
    }
  } catch (error) {
    console.error('Error fetching matiere data:', error);
    // @ts-ignore
    setSnackbar({
      open: true,
      message: error.message || 'Une erreur est survenue',
      severity: 'error',
    });
  } finally {
    setLoading(false);
  }
};

  // Function to handle token refresh and API requests
  const fetchWithTokenRefresh = async (url, options = {}) => {
    let token = localStorage.getItem('accessToken');
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    // If the request fails with a 401 error, try refreshing the token
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        // Retry the request with the new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
      } else {
        // Log out the user if the refresh fails
        logout();
        return null;
      }
    }

    return response;
  };

  // Handle Matiere filter change
  const handleMatiereChange = (event) => {
    setSelectedMatiere(event.target.value);
  };

  // Summary stats
  const summaryStats = [
    { title: 'Matières enseignées', value: matieres.length, icon: <PeopleIcon color="primary" fontSize="large" /> },
    { title: 'Moyenne de la classe', value: matiereStats.length > 0 ? `${matiereStats[0].average_grade}/20` : '0/20', icon: <TrendingUpIcon color="success" fontSize="large" /> },
    { title: 'Meilleure note', value: matiereStats.length > 0 ? `${matiereStats[0].highest_grade}/20` : '0/20', icon: <WarningIcon color="error" fontSize="large" /> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de Bord Enseignant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue! Voici un aperçu de vos classes et activités récentes.
        </Typography>
      </Box>

      {/* Matiere Filter */}
      <Box sx={{ mb: 4 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="matiere-filter-label">Filtrer par Matière</InputLabel>
          <Select
            labelId="matiere-filter-label"
            value={selectedMatiere}
            onChange={handleMatiereChange}
            label="Filtrer par Matière"
          >
            {matieres.map((matiere) => (
              <MenuItem key={matiere.id} value={matiere.id}>
                {matiere.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h5" component="div" align="center">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Attendance Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assiduité de la Semaine
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="#4CAF50" name="Présents" />
                    <Bar dataKey="absent" fill="#F44336" name="Absents" />
                    <Bar dataKey="late" fill="#FFC107" name="Retards" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Grade Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribution des Notes
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3F51B5" name="Nombre d'élèves" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default TeacherDashboard;

function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}