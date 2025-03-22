import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useTheme,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchWithTokenRefresh, checkAuthStatus, getUserRole } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CategoryIcon from '@mui/icons-material/Category';
import TimelineIcon from '@mui/icons-material/Timeline';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

const TeacherAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  // Vérification de l'authentification et du rôle de l'utilisateur
  useEffect(() => {
    const checkAuth = async () => {
      const user = await checkAuthStatus();
      if (!user || getUserRole() !== 'teacher') {
        navigate('/login'); // Redirection vers la page de connexion si non authentifié ou non enseignant
      }
    };

    checkAuth();
  }, [navigate]);

  // Récupération des matières au chargement du composant
  useEffect(() => {
    const fetchMatieres = async () => {
      setLoading(true);
      try {
        const response = await fetchWithTokenRefresh('/api/teacher/matieres/');
        const data = await response.json();
        if (data.success) {
          setMatieres(data.matieres);
          if (data.matieres.length > 0) {
            setSelectedMatiere(data.matieres[0].id); // Définit la première matière comme valeur par défaut
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatieres();
  }, []);

  // Récupération des données lorsque selectedMatiere change
  useEffect(() => {
    if (selectedMatiere) {
      fetchData(selectedMatiere);
    }
  }, [selectedMatiere]);

  // Récupération des alertes, classifications, prédictions et recommandations
  const fetchData = async (matiereId) => {
    setLoading(true);
    setError(null);
  
    try {
      // Récupération des alertes
      const alertsResponse = await fetchWithTokenRefresh(`/api/teacher/alerts/?matiere_id=${matiereId}`);
      const alertsData = await alertsResponse.json();
      if (alertsData.success) {
        setAlerts(
          alertsData.alerts.map((alert) => ({
            ...alert,
            id: alert.student_id || alert.id,
            student_name: alert.student_name || "Étudiant Inconnu",  // Valeur par défaut pour les noms manquants
          }))
        );
      }
  
      // Récupération des classifications
      const classificationsResponse = await fetchWithTokenRefresh(`/api/teacher/classifications/?matiere_id=${matiereId}`);
      const classificationsData = await classificationsResponse.json();
      if (classificationsData.success) {
        setClassifications(
          classificationsData.classifications.map((classification) => ({
            ...classification,
            id: classification.student_id || classification.id,
            student_name: classification.student_name || "Étudiant Inconnu",  // Valeur par défaut pour les noms manquants
          }))
        );
      }
  
      // Récupération des prédictions
      const predictionsResponse = await fetchWithTokenRefresh(`/api/teacher/predictions/?matiere_id=${matiereId}`);
      const predictionsData = await predictionsResponse.json();
      if (predictionsData.success) {
        setPredictions(
          predictionsData.predictions.map((prediction) => ({
            ...prediction,
            id: prediction.student_id || prediction.id,
            student_name: prediction.student_name || "Étudiant Inconnu",  // Valeur par défaut pour les noms manquants
          }))
        );
      }
  
      // Récupération des recommandations
      const recommendationsResponse = await fetchWithTokenRefresh(`/api/teacher/recommendations/?matiere_id=${matiereId}`);
      const recommendationsData = await recommendationsResponse.json();
      if (recommendationsData.success) {
        setRecommendations(
          recommendationsData.recommendations.map((recommendation) => ({
            ...recommendation,
            id: recommendation.student_id || recommendation.id,
            student_name: recommendation.student_name || "Étudiant Inconnu",  // Valeur par défaut pour les noms manquants
          }))
        );
      }
    } catch (err) {
      setError(err.message || 'Échec de récupération des données');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer le rafraîchissement
  const handleRefresh = () => {
    if (selectedMatiere) {
      fetchData(selectedMatiere);
    }
  };

  // Fonction utilitaire pour obtenir la couleur de la catégorie de performance
  const getCategoryColor = (category) => {
    if (!category) return theme.palette.grey[500];
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('excellent') || categoryLower.includes('élevé')) {
      return theme.palette.success.main;
    } else if (categoryLower.includes('bon') || categoryLower.includes('moyen')) {
      return theme.palette.primary.main;
    } else if (categoryLower.includes('passable') || categoryLower.includes('modéré')) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.error.main;
    }
  };

  // Fonction utilitaire pour obtenir la couleur du score prédit
  const getPredictionColor = (score) => {
    if (score === undefined || score === null) return theme.palette.grey[500];
    
    if (score >= 16) return theme.palette.success.main;
    if (score >= 12) return theme.palette.primary.main;
    if (score >= 8) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Colonnes améliorées pour DataGrid
  const alertsColumns = [
    { 
      field: 'student_name', 
      headerName: 'Nom de l\'Étudiant', 
      width: 200,
      renderCell: (params) => (
        <Typography fontWeight="medium">{params.value}</Typography>
      )
    },
    { 
      field: 'message', 
      headerName: 'Message d\'Alerte', 
      flex: 1,
      minWidth: 400,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: theme.palette.warning.main }} />
          <Typography>{params.value}</Typography>
        </Box>
      )
    },
  ];

  const classificationsColumns = [
    { 
      field: 'student_name', 
      headerName: 'Nom de l\'Étudiant', 
      width: 200,
      renderCell: (params) => (
        <Typography fontWeight="medium">{params.value}</Typography>
      )
    },
    { 
      field: 'performance_category', 
      headerName: 'Catégorie de Performance', 
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Chip 
          icon={<CategoryIcon />}
          label={params.value} 
          sx={{ 
            bgcolor: getCategoryColor(params.value),
            color: 'white',
            fontWeight: 'medium'
          }} 
        />
      )
    },
  ];

  const predictionsColumns = [
    { 
      field: 'student_name', 
      headerName: 'Nom de l\'Étudiant', 
      width: 200,
      renderCell: (params) => (
        <Typography fontWeight="medium">{params.value}</Typography>
      )
    },
    { 
      field: 'predicted_score', 
      headerName: 'Note Prédite', 
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Chip 
          icon={<TimelineIcon />}
          label={params.value} 
          sx={{ 
            bgcolor: getPredictionColor(params.value),
            color: 'white',
            fontWeight: 'medium'
          }} 
        />
      )
    },
  ];

  const recommendationsColumns = [
    { 
      field: 'student_name', 
      headerName: 'Nom de l\'Étudiant', 
      width: 200,
      renderCell: (params) => (
        <Typography fontWeight="medium">{params.value}</Typography>
      )
    },
    { 
      field: 'message', 
      headerName: 'Recommandation', 
      flex: 1,
      minWidth: 400,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiObjectsIcon sx={{ color: theme.palette.primary.main }} />
          <Typography>{params.value}</Typography>
        </Box>
      )
    },
  ];

  // Styles communs pour DataGrid
  const dataGridSx = {
    '& .MuiDataGrid-cell': {
      py: 1.5
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: 'rgba(0, 0, 0, 0.03)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
    },
    '& .MuiDataGrid-row:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  };

  return (
    <Box >
      {/* Section d'en-tête */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            Tableau de Bord d'Analyse des Étudiants
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Suivez les métriques de performance des étudiants et recevez des insights basés sur l'IA
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {/* Section de filtres et d'actions */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
              <InputLabel id="matiere-select-label">Sélectionner un Cours</InputLabel>
              <Select
                labelId="matiere-select-label"
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                label="Sélectionner un Cours"
                sx={{ borderRadius: 1 }}
              >
                {matieres.map((matiere) => (
                  <MenuItem key={matiere.id} value={matiere.id}>
                    {matiere.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Tooltip title="Rafraîchir les Données">
              <IconButton 
                onClick={handleRefresh} 
                color="primary"
                sx={{ 
                  bgcolor: 'rgba(76, 175, 80, 0.08)',
                  '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.16)' },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      {/* Indicateur de chargement */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {/* Message d'erreur */}
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {!loading && (
        <Grid container spacing={3}>
          {/* Carte des Alertes */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ 
                py: 1.5, 
                px: 3, 
                bgcolor: 'rgba(0, 0, 0, 0.03)', 
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <WarningIcon sx={{ color: theme.palette.warning.main }} />
                <Typography variant="h6" fontWeight="bold">
                  Alertes Étudiants
                </Typography>
              </Box>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box sx={{ height: 'auto', width: '100%' }}>
                  <DataGrid
                    rows={alerts}
                    columns={alertsColumns}
                    getRowId={(row) => row.id}
                    paginationModel={{ pageSize: 5, page: 0 }}
                    pageSizeOptions={[5]}
                    autoHeight
                    disableRowSelectionOnClick
                    sx={dataGridSx}
                    localeText={{
                      noRowsLabel: 'Pas d\'alertes disponibles',
                      footerRowSelected: count => `${count} ligne${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}`,
                      columnMenuLabel: 'Menu',
                      columnMenuShowColumns: 'Afficher les colonnes',
                      columnMenuFilter: 'Filtrer',
                      columnMenuHideColumn: 'Cacher',
                      columnMenuUnsort: 'Annuler le tri',
                      columnMenuSortAsc: 'Tri croissant',
                      columnMenuSortDesc: 'Tri décroissant',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Carte des Classifications */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
              <Box sx={{ 
                py: 1.5, 
                px: 3, 
                bgcolor: 'rgba(0, 0, 0, 0.03)', 
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CategoryIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight="bold">
                  Classifications de Performance
                </Typography>
              </Box>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box sx={{ height: 'auto', width: '100%' }}>
                  <DataGrid
                    rows={classifications}
                    columns={classificationsColumns}
                    getRowId={(row) => row.id}
                    paginationModel={{ pageSize: 5, page: 0 }}
                    pageSizeOptions={[5]}
                    autoHeight
                    disableRowSelectionOnClick
                    sx={dataGridSx}
                    localeText={{
                      noRowsLabel: 'Pas de classifications disponibles',
                      footerRowSelected: count => `${count} ligne${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}`,
                      columnMenuLabel: 'Menu',
                      columnMenuShowColumns: 'Afficher les colonnes',
                      columnMenuFilter: 'Filtrer',
                      columnMenuHideColumn: 'Cacher',
                      columnMenuUnsort: 'Annuler le tri',
                      columnMenuSortAsc: 'Tri croissant',
                      columnMenuSortDesc: 'Tri décroissant',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Carte des Prédictions */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
              <Box sx={{ 
                py: 1.5, 
                px: 3, 
                bgcolor: 'rgba(0, 0, 0, 0.03)', 
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <TimelineIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight="bold">
                  Prédictions de Notes
                </Typography>
              </Box>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box sx={{ height: 'auto', width: '100%' }}>
                  <DataGrid
                    rows={predictions}
                    columns={predictionsColumns}
                    getRowId={(row) => row.id}
                    paginationModel={{ pageSize: 5, page: 0 }}
                    pageSizeOptions={[5]}
                    autoHeight
                    disableRowSelectionOnClick
                    sx={dataGridSx}
                    localeText={{
                      noRowsLabel: 'Pas de prédictions disponibles',
                      footerRowSelected: count => `${count} ligne${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}`,
                      columnMenuLabel: 'Menu',
                      columnMenuShowColumns: 'Afficher les colonnes',
                      columnMenuFilter: 'Filtrer',
                      columnMenuHideColumn: 'Cacher',
                      columnMenuUnsort: 'Annuler le tri',
                      columnMenuSortAsc: 'Tri croissant',
                      columnMenuSortDesc: 'Tri décroissant',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Carte des Recommandations */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ 
                py: 1.5, 
                px: 3, 
                bgcolor: 'rgba(0, 0, 0, 0.03)', 
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <EmojiObjectsIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight="bold">
                  Recommandations Pédagogiques
                </Typography>
              </Box>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box sx={{ height: 'auto', width: '100%' }}>
                  <DataGrid
                    rows={recommendations}
                    columns={recommendationsColumns}
                    getRowId={(row) => row.id}
                    paginationModel={{ pageSize: 5, page: 0 }}
                    pageSizeOptions={[5]}
                    autoHeight
                    disableRowSelectionOnClick
                    sx={dataGridSx}
                    localeText={{
                      noRowsLabel: 'Pas de recommandations disponibles',
                      footerRowSelected: count => `${count} ligne${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}`,
                      columnMenuLabel: 'Menu',
                      columnMenuShowColumns: 'Afficher les colonnes',
                      columnMenuFilter: 'Filtrer',
                      columnMenuHideColumn: 'Cacher',
                      columnMenuUnsort: 'Annuler le tri',
                      columnMenuSortAsc: 'Tri croissant',
                      columnMenuSortDesc: 'Tri décroissant',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default TeacherAnalysis;