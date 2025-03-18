import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card, 
  CardContent,
  CardHeader,
  Divider,
  Avatar,
  Chip,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import PersonIcon from "@mui/icons-material/Person";
import FilterListIcon from "@mui/icons-material/FilterList";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";

const TeacherAlerts = () => {
  // État pour stocker les alertes récupérées depuis l'API
  const [alerts, setAlerts] = useState([]);
  // État pour filtrer les alertes
  const [filterType, setFilterType] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  // État pour l'alerte sélectionnée
  const [selectedAlert, setSelectedAlert] = useState(null);
  // État pour stocker les classes enseignées par le professeur connecté
  const [teacherClasses, setTeacherClasses] = useState([]);
  // État pour gérer le chargement des données
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les alertes du professeur connecté
  const fetchTeacherAlerts = async () => {
    setLoading(true);
    try {
      // Dans un cas réel, vous feriez un appel API à votre backend Django
      // const response = await fetch('/api/teacher/my-alerts');
      // const data = await response.json();
      
      // Pour la démo, on simule les données
      // Supposons que l'enseignant connecté n'enseigne que dans Licence Info 1 et Master MIAGE
      const teacherClassIds = [1, 3]; // IDs des classes enseignées par ce prof
      
      // Filtrer les mockAlerts pour ne garder que ceux des classes de l'enseignant
      const teacherAlerts = mockAlerts.filter(alert => 
        teacherClassIds.includes(alert.class.id)
      );
      
      // Récupérer uniquement les classes enseignées par ce prof
      const classes = [
        { id: 1, name: "Licence Info 1" },
        { id: 3, name: "Master MIAGE" },
      ];
      
      setTeacherClasses(classes);
      setAlerts(teacherAlerts);
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Données fictives pour démo
  const mockAlerts = [
    {
      id: 1,
      student: { id: 101, name: "Mohammed Alami", avatar: null },
      type: "absence",
      severity: "high",
      message: "3 absences consécutives en cours d'Algorithmes",
      date: "2025-03-08",
      class: { id: 1, name: "Licence Info 1" },
      details: "L'étudiant a manqué 3 cours consécutifs et n'a pas rendu le dernier devoir.",
      predictions: {
        risk: "Risque élevé d'échec dans ce module (probabilité 78%)",
        impact: "Peut affecter sa moyenne générale de -2.5 points"
      }
    },
    {
      id: 2,
      student: { id: 102, name: "Sara Bennani", avatar: null },
      type: "performance",
      severity: "medium",
      message: "Baisse significative des performances en Mathématiques",
      date: "2025-03-05",
      class: { id: 1, name: "Licence Info 1" },
      details: "Chute de 5 points entre les deux dernières évaluations.",
      predictions: {
        risk: "Risque modéré de ne pas valider ce module (probabilité 45%)",
        impact: "Nécessite une amélioration de 3 points pour atteindre la moyenne"
      }
    },
    {
      id: 3,
      student: { id: 103, name: "Youssef Tazi", avatar: null },
      type: "behavior",
      severity: "low",
      message: "Participation réduite pendant les cours de Programmation",
      date: "2025-03-09",
      class: { id: 2, name: "Licence Info 2" },
      details: "Étudiant habituellement actif qui participe moins depuis 2 semaines.",
      predictions: {
        risk: "Risque faible d'impact sur les performances (probabilité 20%)",
        impact: "Surveillez l'évolution lors des prochains cours"
      }
    },
    {
      id: 4,
      student: { id: 104, name: "Amina Kadiri", avatar: null },
      type: "performance",
      severity: "high",
      message: "Résultats insuffisants aux 3 derniers contrôles de Java",
      date: "2025-03-07",
      class: { id: 3, name: "Master MIAGE" },
      details: "Notes inférieures à 7/20 sur les trois dernières évaluations.",
      predictions: {
        risk: "Risque très élevé d'échec (probabilité 91%)",
        impact: "Nécessite un plan de remédiation immédiat"
      }
    },
  ];

  // Charger les alertes du professeur au chargement du composant
  useEffect(() => {
    fetchTeacherAlerts();
  }, []);

  // Fonction pour filtrer les alertes
  const filteredAlerts = alerts.filter(alert => {
    const typeMatch = filterType === "all" || alert.type === filterType;
    const classMatch = selectedClass === "all" || alert.class.id === parseInt(selectedClass);
    return typeMatch && classMatch;
  });

  // Gestion des couleurs selon la sévérité
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "#f44336";
      case "medium": return "#ff9800";
      case "low": return "#2196f3";
      default: return "#757575";
    }
  };

  // Gestion des icônes selon le type d'alerte
  const getAlertIcon = (type) => {
    switch (type) {
      case "absence": return <PersonIcon />;
      case "performance": return <AssignmentIcon />;
      case "behavior": return <SchoolIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="div">
        Alertes et Prédictions
      </Typography>
      
      <Grid container spacing={3}>
        {/* Filtres */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <FilterListIcon />
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type d'alerte</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type d'alerte"
              >
                <MenuItem value="all">Tous les types</MenuItem>
                <MenuItem value="absence">Absences</MenuItem>
                <MenuItem value="performance">Performances</MenuItem>
                <MenuItem value="behavior">Comportement</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Classe</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Classe"
              >
                <MenuItem value="all">Toutes mes classes</MenuItem>
                {teacherClasses.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>
        
        {/* Liste des alertes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Mes Alertes ({filteredAlerts.length})
            </Typography>
            {loading ? (
              <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                Chargement des alertes...
              </Typography>
            ) : (
              <List>
                {filteredAlerts.map((alert) => (
                  <React.Fragment key={alert.id}>
                    <ListItemButton 
                      sx={{ 
                        borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                        mb: 1,
                        backgroundColor: selectedAlert?.id === alert.id ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                      }}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          {getAlertIcon(alert.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={alert.student.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {alert.message}
                            </Typography>
                            <br />
                            <Typography component="span" variant="caption">
                              {alert.class.name} • {new Date(alert.date).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                      <Chip 
                        size="small" 
                        label={alert.type} 
                        sx={{ ml: 1 }}
                      />
                    </ListItemButton>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
                {filteredAlerts.length === 0 && !loading && (
                  <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                    Aucune alerte ne correspond aux critères sélectionnés.
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Détails de l'alerte sélectionnée */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
            {selectedAlert ? (
              <>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: getSeverityColor(selectedAlert.severity), width: 56, height: 56 }}>
                    {getAlertIcon(selectedAlert.type)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedAlert.student.name}</Typography>
                    <Typography variant="body2">{selectedAlert.class.name}</Typography>
                  </Box>
                </Box>
                
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="Détails de l'alerte" />
                  <CardContent>
                    <Typography variant="body1" paragraph>
                      {selectedAlert.message}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {selectedAlert.details}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Prédictions générées par le système
                    </Typography>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'background.default', 
                      borderRadius: 1, 
                      border: '1px solid', 
                      borderColor: 'divider'
                    }}>
                      <Typography variant="body2" paragraph sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="error" fontSize="small" />
                        {selectedAlert.predictions.risk}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoIcon color="info" fontSize="small" />
                        {selectedAlert.predictions.impact}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
                color: 'text.secondary'
              }}>
                <InfoIcon fontSize="large" />
                <Typography>Sélectionnez une alerte pour voir les détails</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherAlerts;