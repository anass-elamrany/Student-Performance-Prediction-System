import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Button,
  CircularProgress
} from "@mui/material";
import {
  Warning,
  CheckCircle,
  Info,
  Announcement,
  NotificationsActive
} from "@mui/icons-material";

const StudentAlerts = () => {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un appel API pour récupérer les alertes
    const fetchData = async () => {
      try {
        // Remplacer par un vrai appel API
        setTimeout(() => {
          const alertsData = {
            urgentAlerts: [
              {
                id: 1,
                title: "Travaux Pratiques non remis",
                description: "TP d'Algorithmique à remettre avant demain 23h59",
                course: "Algorithmique",
                dueDate: "12/03/2025",
                severity: "high"
              },
              {
                id: 2,
                title: "Note en dessous du seuil",
                description: "Votre note en Intelligence Artificielle (9/20) est inférieure au seuil de passage",
                course: "Intelligence Artificielle",
                severity: "high"
              }
            ],
            warningAlerts: [
              {
                id: 3,
                title: "Baisse de performance",
                description: "Votre moyenne en Systèmes Distribués a baissé de 2 points ce mois-ci",
                course: "Systèmes Distribués",
                severity: "medium"
              },
              {
                id: 4,
                title: "Présence insuffisante",
                description: "Taux de présence de 65% en cours de Bases de Données (minimum requis: 80%)",
                course: "Bases de Données",
                severity: "medium"
              }
            ],
            infoAlerts: [
              {
                id: 5,
                title: "Examen à venir",
                description: "Examen d'Analyse de Données prévu le 20/03/2025",
                course: "Analyse de Données",
                date: "20/03/2025",
                severity: "low"
              },
              {
                id: 6,
                title: "Nouvelle ressource disponible",
                description: "Nouvelle documentation sur le framework React ajoutée au cours Web",
                course: "Web",
                severity: "low"
              }
            ],
            successAlerts: [
              {
                id: 7,
                title: "Objectif atteint",
                description: "Moyenne en Programmation améliorée de 3 points ce semestre",
                course: "Programmation",
                improvement: "+3.0"
              },
              {
                id: 8,
                title: "TP validé avec excellence",
                description: "Votre TP de Bases de Données a obtenu la note de 18/20",
                course: "Bases de Données",
                grade: "18/20"
              }
            ]
          };

          setAlerts(alertsData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Chargement des alertes...
        </Typography>
      </Box>
    );
  }

  const { urgentAlerts, warningAlerts, infoAlerts, successAlerts } = alerts;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <NotificationsActive sx={{ mr: 1, verticalAlign: "middle" }} />
        Alertes par matière
      </Typography>

      {/* Alertes urgentes */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
        <Warning sx={{ mr: 1, color: "error.main" }} />
        Alertes urgentes ({urgentAlerts.length})
      </Typography>
      {urgentAlerts.map((alert) => (
        <Alert 
          severity="error" 
          key={alert.id}
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small">
              AGIR
            </Button>
          }
        >
          <AlertTitle>
            {alert.title} - {alert.course}
          </AlertTitle>
          {alert.description}
          {alert.dueDate && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Date limite:</strong> {alert.dueDate}
            </Typography>
          )}
        </Alert>
      ))}

      {/* Avertissements */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
        <Announcement sx={{ mr: 1, color: "warning.main" }} />
        Avertissements ({warningAlerts.length})
      </Typography>
      {warningAlerts.map((alert) => (
        <Alert 
          severity="warning" 
          key={alert.id}
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small">
              CONSULTER
            </Button>
          }
        >
          <AlertTitle>{alert.title} - {alert.course}</AlertTitle>
          {alert.description}
        </Alert>
      ))}

      {/* Informations */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
        <Info sx={{ mr: 1, color: "info.main" }} />
        Informations ({infoAlerts.length})
      </Typography>
      {infoAlerts.map((alert) => (
        <Alert 
          severity="info" 
          key={alert.id}
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small">
              DÉTAILS
            </Button>
          }
        >
          <AlertTitle>{alert.title} - {alert.course}</AlertTitle>
          {alert.description}
          {alert.date && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Date:</strong> {alert.date}
            </Typography>
          )}
        </Alert>
      ))}

      {/* Succès */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
        <CheckCircle sx={{ mr: 1, color: "success.main" }} />
        Bons résultats ({successAlerts.length})
      </Typography>
      {successAlerts.map((alert) => (
        <Alert 
          severity="success" 
          key={alert.id}
          sx={{ mb: 2 }}
        >
          <AlertTitle>{alert.title} - {alert.course}</AlertTitle>
          {alert.description}
        </Alert>
      ))}
    </Box>
  );
};

export default StudentAlerts;