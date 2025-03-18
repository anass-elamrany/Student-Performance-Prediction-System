import  { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  CircularProgress
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SchoolIcon from '@mui/icons-material/School';
import WarningIcon from '@mui/icons-material/Warning';

const AdminDashboard = () => {
  // State for filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('semester');
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Mock data for charts
  const performanceData = [
    { month: 'Jan', average: 76, target: 75 },
    { month: 'Feb', average: 74, target: 75 },
    { month: 'Mar', average: 78, target: 75 },
    { month: 'Apr', average: 80, target: 75 },
    { month: 'May', average: 79, target: 75 },
    { month: 'Jun', average: 82, target: 75 },
  ];
  
  const categoryDistribution = [
    { name: 'Excellents', value: 30, color: '#4CAF50' },
    { name: 'Bons', value: 45, color: '#2196F3' },
    { name: 'Moyens', value: 15, color: '#FFC107' },
    { name: 'À risque', value: 10, color: '#F44336' },
  ];
  
  const subjectsPerformance = [
    { subject: 'Mathématiques', succesRate: 78 },
    { subject: 'Physique', succesRate: 72 },
    { subject: 'Informatique', succesRate: 85 },
    { subject: 'Langues', succesRate: 80 },
    { subject: 'Sciences', succesRate: 76 },
  ];
  
  const attendanceData = [
    { month: 'Jan', rate: 92 },
    { month: 'Feb', rate: 94 },
    { month: 'Mar', rate: 91 },
    { month: 'Apr', rate: 93 },
    { month: 'May', rate: 95 },
    { month: 'Jun', rate: 96 },
  ];
  
  // List of classes and periods for filters
  const classes = [
    { id: 'all', name: 'Toutes les classes' },
    { id: 'class1', name: 'Classe A' },
    { id: 'class2', name: 'Classe B' },
    { id: 'class3', name: 'Classe C' },
  ];
  
  const periods = [
    { id: 'semester1', name: 'Semestre 1' },
    { id: 'semester2', name: 'Semestre 2' },
    { id: 'semester3', name: 'Semestre 3' },
    { id: 'semester4', name: 'Semestre 4' },
  ];
  
  // Summary stats
  const stats = [
    { title: 'Moyenne générale', value: '14.5/20', icon: <AssessmentIcon color="primary" fontSize="large" />, trend: 'up' },
    { title: 'Taux de présence', value: '94%', icon: <SchoolIcon color="success" fontSize="large" />, trend: 'up' },
    { title: 'Taux de réussite', value: '82%', icon: <TrendingUpIcon color="info" fontSize="large" />, trend: 'up' },
    { title: 'Étudiants à risque', value: '10%', icon: <WarningIcon color="error" fontSize="large" />, trend: 'down' },
  ];
  
  // Simulated fetch data effect
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [selectedClass, selectedPeriod]);
  
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
      
      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Classe</InputLabel>
              <Select
                value={selectedClass}
                label="Classe"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Période</InputLabel>
              <Select
                value={selectedPeriod}
                label="Période"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periods.map((period) => (
                  <MenuItem key={period.id} value={period.id}>{period.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {!loading && (
        <>
          {/* Summary Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      {stat.icon}
                      {stat.trend === 'up' && <TrendingUpIcon color="success" />}
                      {stat.trend === 'down' && <TrendingDownIcon color={stat.title.includes('risque') ? 'success' : 'error'} />}
                    </Box>
                    <Typography variant="h5" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Main Charts */}
          <Grid container spacing={4}>
            {/* Performance Trend */}
            <Grid item xs={12} lg={6}>
              <Card>
                <CardHeader title="Évolution des Performances" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={performanceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[60, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="average" 
                          stroke="#2196F3" 
                          name="Moyenne" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="#FF9800" 
                          name="Objectif" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Attendance Rate */}
            <Grid item xs={12} lg={6}>
              <Card>
                <CardHeader title="Taux de Présence" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={attendanceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#4CAF50" 
                          name="Taux de présence (%)" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Category Distribution */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Répartition par Catégorie" />
                <Divider />
                <CardContent>
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
                          label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Pourcentage']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Subject Success Rate */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Taux de Réussite par Matière" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={subjectsPerformance}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barSize={40}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="succesRate" 
                          fill="#673AB7" 
                          name="Taux de réussite (%)" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AdminDashboard;