import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  LinearProgress, 
  useTheme,
  Card,
  CardContent,
  Divider
} from "@mui/material";
import { 
  School, 
  TrendingUp, 
  Warning, 
  ShowChart, 
  PieChart as PieChartIcon
} from "@mui/icons-material";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { fetchWithTokenRefresh } from "../../utils/auth";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetchWithTokenRefresh("http://localhost:8000/api/student/dashboard/");
        const data = await response.json();

        console.log("API Response:", data); // Debugging: Log the API response

        if (data.success) {
          setStudentData(data);
        } else {
          console.error("API error:", data.message);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress color="primary" />
      </Box>
    );
  }

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main || "#00C49F", 
    theme.palette.warning.main,
    theme.palette.error.main || "#FF8042", 
    theme.palette.info.main || "#8884d8"
  ];
  
  const alertCount = studentData.notifications.filter(n => n.type === "alert").length;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Bienvenue, {studentData?.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Tableau de bord | Vue d'ensemble
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {/* Cartes de résumé */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              height: 140, 
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Moyenne Générale</Typography>
              <Typography variant="h3" color="primary.main" sx={{ mt: 2, fontWeight: "bold" }}>
                {studentData.currentAverage.toFixed(1)}/20
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              height: 140,
              borderLeft: `4px solid ${theme.palette.success.main}`,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Taux de présence</Typography>
              <Typography variant="h3" color="success.main" sx={{ mt: 2, fontWeight: "bold" }}>
                {studentData.attendanceRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              height: 140,
              borderLeft: `4px solid ${theme.palette.info.main}`,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Notes récentes</Typography>
              <Typography variant="h3" color="info.main" sx={{ mt: 2, fontWeight: "bold" }}>
                {studentData.recentGrades.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2} 
            sx={{ 
              height: 140,
              borderLeft: `4px solid ${theme.palette.warning.main}`,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                
                Nombre d'alertes
              </Typography>
              <Typography variant="h3" color="warning.main" sx={{ mt: 2, fontWeight: "bold" }}>
                {alertCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphiques et statistiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ShowChart sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="medium">
                  Évolution de vos performances
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={studentData.monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: theme.palette.text.secondary }}
                    axisLine={{ stroke: theme.palette.divider }}
                  />
                  <YAxis 
                    domain={[0, 20]} 
                    tick={{ fill: theme.palette.text.secondary }}
                    axisLine={{ stroke: theme.palette.divider }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.primary
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="average" 
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    activeDot={{ r: 8, fill: theme.palette.primary.main }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PieChartIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="medium">
                  Performance par matière
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={studentData.subjectPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={90}
                    fill={theme.palette.primary.main}
                    dataKey="value"
                  >
                    {studentData.subjectPerformance.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.primary
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;