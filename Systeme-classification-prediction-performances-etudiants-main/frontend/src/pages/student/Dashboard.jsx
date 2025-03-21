import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, LinearProgress } from "@mui/material";
import { School, TrendingUp, Warning } from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { fetchWithTokenRefresh } from "../../utils/auth";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <LinearProgress />
      </Box>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  const alertCount = studentData.notifications.filter(n => n.type === "alert").length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenue, {studentData?.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Tableau de bord | Vue d'ensemble
      </Typography>

      {/* Cartes de résumé */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: "flex", flexDirection: "column", height: 120, bgcolor: "primary.light", color: "white" }}>
            <Typography variant="subtitle2">Moyenne Générale</Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              {studentData.currentAverage.toFixed(1)}/20
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: "flex", flexDirection: "column", height: 120, bgcolor: "success.light", color: "white" }}>
            <Typography variant="subtitle2">Taux de présence</Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              {studentData.attendanceRate}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: "flex", flexDirection: "column", height: 120, bgcolor: "info.light", color: "white" }}>
            <Typography variant="subtitle2">Notes récentes</Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              {studentData.recentGrades.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: "flex", flexDirection: "column", height: 120, bgcolor: "warning.light", color: "white" }}>
            <Typography variant="subtitle2">
              <Warning sx={{ mr: 1, verticalAlign: "middle", fontSize: "small" }} />
              Nombre d'alertes
            </Typography>
            <Typography variant="h3" sx={{ mt: 2 }}>
              {alertCount}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Graphiques et statistiques */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <TrendingUp sx={{ mr: 1, verticalAlign: "middle" }} />
              Évolution de vos performances
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studentData.monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <School sx={{ mr: 1, verticalAlign: "middle" }} />
              Performance par matière
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentData.subjectPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {studentData.subjectPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;