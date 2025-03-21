import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  LinearProgress,
  Grid,
  Divider,
  Chip,
  Badge
} from "@mui/material";
import { Notifications, School, CalendarToday, PriorityHigh } from "@mui/icons-material";
import { fetchWithTokenRefresh } from "../../utils/auth";

const StudentAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetchWithTokenRefresh("http://localhost:8000/api/student/alerts/");
      const data = await response.json();

      console.log("API Response:", data); // Debugging: Log the API response

      if (data.success && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      } else {
        console.error("Invalid API response format:", data);
        setAlerts([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  // Group alerts by priority
  const groupedAlerts = alerts.reduce((groups, alert) => {
    const priority = alert.priorite || "Normal";
    if (!groups[priority]) {
      groups[priority] = [];
    }
    groups[priority].push(alert);
    return groups;
  }, {});

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "haute":
        return "error";
      case "moyenne":
        return "warning";
      case "basse":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mes Alertes
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Consultez les alertes importantes concernant vos cours et examens
      </Typography>

      {alerts.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", mt: 3 }}>
          <Notifications sx={{ fontSize: 40, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6">
            Aucune alerte disponible pour le moment.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Les alertes apparaîtront ici lorsque vos enseignants ou l'administration en génèreront.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Recent alerts */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              <Notifications sx={{ mr: 1, verticalAlign: "middle" }} />
              Alertes récentes
            </Typography>
            <Grid container spacing={3}>
              {alerts.slice(0, 3).map((alert) => (
                <Grid item xs={12} md={4} key={alert.id}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        {alert.matiere && (
                          <Chip 
                            icon={<School />} 
                            label={alert.matiere.nom} 
                            color="primary" 
                            size="small"
                          />
                        )}
                        <Chip 
                          icon={<PriorityHigh />} 
                          label={alert.priorite || "Normal"} 
                          color={getPriorityColor(alert.priorite || "Normal")} 
                          size="small" 
                        />
                      </Box>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {alert.titre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {alert.contenu}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                        <CalendarToday fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {alert.date_creation}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* All alerts by priority */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              <PriorityHigh sx={{ mr: 1, verticalAlign: "middle" }} />
              Alertes par priorité
            </Typography>
            
            {Object.entries(groupedAlerts).map(([priority, priorityAlerts]) => (
              <Paper key={priority} sx={{ mb: 3, p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Badge 
                    badgeContent={priorityAlerts.length} 
                    color={getPriorityColor(priority)}
                    sx={{ mr: 2 }}
                  >
                    <Notifications />
                  </Badge>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Priorité: {priority}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {priorityAlerts.map((alert) => (
                  <Box key={alert.id} sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: "divider" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        {alert.titre}
                      </Typography>
                      {alert.matiere && (
                        <Chip 
                          icon={<School />} 
                          label={alert.matiere.nom} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                    <Typography variant="body2">
                      {alert.contenu}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <CalendarToday fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {alert.date_creation}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default StudentAlerts;