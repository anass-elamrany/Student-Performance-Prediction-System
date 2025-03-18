import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, LinearProgress } from "@mui/material";
import { School, TrendingUp, Warning } from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un appel API pour récupérer les données de l'étudiant
    const fetchStudentData = async () => {
      try {
        // Remplacer par un vrai appel API
        setTimeout(() => {
          setStudentData({
            name: "Alexandre Dupont",
            currentAverage: 14.2,
            attendanceRate: 92,
            upcomingAssignments: [
              { title: "Projet Machine Learning", date: "15/03/2025", course: "Intelligence Artificielle" },
              { title: "Examen de mi-semestre", date: "20/03/2025", course: "Programmation Web" },
            ],
            recentGrades: [
              { course: "Bases de Données", grade: 16, date: "01/03/2025" },
              { course: "Algorithmique", grade: 13.5, date: "25/02/2025" },
              { course: "Intelligence Artificielle", grade: 15, date: "15/02/2025" },
            ],
            monthlyPerformance: [
              { month: "Oct", average: 13.2 },
              { month: "Nov", average: 13.8 },
              { month: "Dec", average: 14.5 },
              { month: "Jan", average: 13.9 },
              { month: "Fev", average: 14.2 },
              { month: "Mar", average: 14.7 },
            ],
            subjectPerformance: [
              { name: "Algorithmique", value: 13.5 },
              { name: "Bases de Données", value: 16 },
              { name: "Intelligence Artificielle", value: 15 },
              { name: "Programmation Web", value: 14 },
              { name: "Architecture", value: 12.5 },
            ],
            notifications: [
              { type: "alert", message: "Votre performance en Architecture est en baisse. Une session de tutorat pourrait vous aider." },
              { type: "info", message: "Vous êtes dans le top 15% de votre promotion en Bases de Données." },
              { type: "success", message: "Votre moyenne a augmenté de 0.5 points ce mois-ci. Continuez comme ça!" },
            ],
          });
          setLoading(false);
        }, 1000);
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