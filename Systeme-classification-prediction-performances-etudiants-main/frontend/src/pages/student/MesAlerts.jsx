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
  Badge,
  alpha,
  useTheme
} from "@mui/material";
import { 
  Notifications, 
  School, 
  CalendarToday, 
  PriorityHigh, 
  NotificationsActive 
} from "@mui/icons-material";
import { fetchWithTokenRefresh } from "../../utils/auth";

const StudentAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  
  // Student theme color from your theme setup
  const studentColor = "#ff9800";

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
        <LinearProgress sx={{ 
          height: 6, 
          borderRadius: 3,
          backgroundColor: alpha(studentColor, 0.15),
          '& .MuiLinearProgress-bar': {
            backgroundColor: studentColor
          }
        }} />
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
    const priorityLower = priority.toLowerCase();
    
    // Maintain the priority color logic but ensure it works with your theme
    switch (priorityLower) {
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

  // Format date for better readability
  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: "bold", 
              color: studentColor 
            }}
          >
            Mes Alertes
          </Typography>
        </Box>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          gutterBottom
          sx={{ ml: 0.5 }}
        >
          Consultez les alertes importantes concernant vos cours et examens
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {alerts.length === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: "center", 
            mt: 3, 
            borderRadius: 2,
            border: `1px solid ${alpha(studentColor, 0.2)}`
          }}
        >
          <Notifications 
            sx={{ 
              fontSize: 60, 
              color: alpha(studentColor, 0.7), 
              mb: 2 
            }} 
          />
          <Typography variant="h6">
            Aucune alerte disponible pour le moment.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Les alertes apparaîtront ici lorsque vos enseignants ou l'administration en génèreront.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Recent alerts */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                display: "flex",
                alignItems: "center",
                color: theme.palette.mode === "light" ? "#333333" : "#ffffff",
                fontWeight: 600
              }}
            >
              <Notifications 
                sx={{ 
                  mr: 1, 
                  verticalAlign: "middle",
                  color: studentColor
                }} 
              />
              Alertes récentes
            </Typography>
            <Grid container spacing={3}>
              {alerts.slice(0, 3).map((alert) => (
                <Grid item xs={12} md={4} key={alert.id}>
                  <Card 
                    sx={{ 
                      height: "100%", 
                      borderRadius: 2,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4
                      },
                      overflow: "hidden",
                      border: `1px solid ${alpha(studentColor, 0.1)}`
                    }}
                  >
                    <Box 
                      sx={{ 
                        height: 8, 
                        backgroundColor: getPriorityColor(alert.priorite || "Normal") === "error" 
                          ? theme.palette.error.main 
                          : getPriorityColor(alert.priorite || "Normal") === "warning"
                            ? theme.palette.warning.main
                            : getPriorityColor(alert.priorite || "Normal") === "info"
                              ? theme.palette.info.main
                              : alpha(studentColor, 0.7)
                      }} 
                    />
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        {alert.matiere && (
                          <Chip 
                            icon={<School />} 
                            label={alert.matiere.nom} 
                            sx={{
                              backgroundColor: alpha(studentColor, 0.1),
                              color: studentColor,
                              fontWeight: 500,
                              "& .MuiChip-icon": {
                                color: studentColor
                              }
                            }}
                            size="small"
                          />
                        )}
                        <Chip 
                          icon={<PriorityHigh />} 
                          label={alert.priorite || "Normal"} 
                          color={getPriorityColor(alert.priorite || "Normal")} 
                          size="small" 
                          sx={{
                            fontWeight: 500
                          }}
                        />
                      </Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 1,
                          fontWeight: "bold",
                          color: theme.palette.mode === "light" ? "#333333" : "#ffffff"
                        }}
                      >
                        {alert.titre}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1,
                          height: 60,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical"
                        }}
                      >
                        {alert.contenu}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CalendarToday 
                          fontSize="small" 
                          sx={{ 
                            color: alpha(studentColor, 0.8), 
                            mr: 1 
                          }} 
                        />
                        <Typography 
                          variant="caption" 
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 500
                          }}
                        >
                          {formatDate(alert.date_creation)}
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
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                display: "flex",
                alignItems: "center",
                color: theme.palette.mode === "light" ? "#333333" : "#ffffff",
                fontWeight: 600
              }}
            >
              <PriorityHigh 
                sx={{ 
                  mr: 1, 
                  verticalAlign: "middle",
                  color: studentColor
                }} 
              />
              Alertes par priorité
            </Typography>
            
            {Object.entries(groupedAlerts).map(([priority, priorityAlerts]) => (
              <Paper 
                key={priority} 
                sx={{ 
                  mb: 3, 
                  p: 3,
                  borderRadius: 2,
                  borderLeft: `6px solid ${
                    getPriorityColor(priority) === "error" 
                      ? theme.palette.error.main 
                      : getPriorityColor(priority) === "warning"
                        ? theme.palette.warning.main
                        : getPriorityColor(priority) === "info"
                          ? theme.palette.info.main
                          : alpha(studentColor, 0.7)
                  }`
                }}
                elevation={2}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Badge 
                    badgeContent={priorityAlerts.length} 
                    color={getPriorityColor(priority)}
                    sx={{ mr: 2 }}
                  >
                    <Notifications 
                      sx={{ 
                        color: getPriorityColor(priority) === "error" 
                          ? theme.palette.error.main 
                          : getPriorityColor(priority) === "warning"
                            ? theme.palette.warning.main
                            : getPriorityColor(priority) === "info"
                              ? theme.palette.info.main
                              : studentColor
                      }} 
                    />
                  </Badge>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: "bold",
                      color: theme.palette.mode === "light" ? "#333333" : "#ffffff"
                    }}
                  >
                    Priorité: {priority}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {priorityAlerts.map((alert, index) => (
                  <Box 
                    key={alert.id} 
                    sx={{ 
                      mb: index < priorityAlerts.length - 1 ? 2 : 0, 
                      pb: index < priorityAlerts.length - 1 ? 2 : 0, 
                      borderBottom: index < priorityAlerts.length - 1 ? 1 : 0, 
                      borderColor: "divider",
                      "&:hover": {
                        backgroundColor: alpha(studentColor, 0.03)
                      },
                      borderRadius: 1,
                      p: 1.5
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: "bold",
                          color: theme.palette.mode === "light" ? "#333333" : "#ffffff"
                        }}
                      >
                        {alert.titre}
                      </Typography>
                      {alert.matiere && (
                        <Chip 
                          icon={<School />} 
                          label={alert.matiere.nom} 
                          size="small" 
                          variant="outlined" 
                          sx={{
                            borderColor: alpha(studentColor, 0.5),
                            color: studentColor,
                            "& .MuiChip-icon": {
                              color: studentColor
                            }
                          }}
                        />
                      )}
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: theme.palette.text.secondary,
                        py: 1
                      }}
                    >
                      {alert.contenu}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <CalendarToday 
                        fontSize="small" 
                        sx={{ 
                          color: alpha(studentColor, 0.7), 
                          mr: 1 
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500
                        }}
                      >
                        {formatDate(alert.date_creation)}
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