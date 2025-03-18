import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
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

const TeacherDashboard = () => {
  // Mock data - in a real app, you would fetch this from your backend
  const [loading, setLoading] = useState(false);
  
  // Attendance data
  const attendanceData = [
    { day: 'Lun', present: 24, absent: 3, late: 2 },
    { day: 'Mar', present: 22, absent: 5, late: 2 },
    { day: 'Mer', present: 25, absent: 1, late: 3 },
    { day: 'Jeu', present: 24, absent: 2, late: 3 },
    { day: 'Ven', present: 20, absent: 7, late: 2 },
  ];
  
  // Grade distribution
  const gradesData = [
    { range: '0-5', count: 2 },
    { range: '6-10', count: 7 },
    { range: '11-15', count: 15 },
    { range: '16-20', count: 5 },
  ];
  
  // Summary stats - removed "Devoirs à corriger"
  const summaryStats = [
    { title: 'Présence moyenne', value: '88%', icon: <PeopleIcon color="primary" fontSize="large" /> },
    { title: 'Moyenne de la classe', value: '13.5/20', icon: <TrendingUpIcon color="success" fontSize="large" /> },
    { title: 'Élèves à risque', value: '3', icon: <WarningIcon color="error" fontSize="large" /> },
  ];
  
  // Simulated fetch data effect
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
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
                  <BarChart
                    data={attendanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    barGap={0}
                    barCategoryGap={10}
                  >
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
                  <BarChart
                    data={gradesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    barSize={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="#3F51B5" 
                      name="Nombre d'élèves" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;