import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  useTheme
} from '@mui/material';
import {
  Recommend as RecommendIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const STATUS_CONFIG = {
  'À risque': {
    color: '#F44336',
    icon: <ErrorIcon />
  },
  'Moyenne performance': {
    color: '#FFC107',
    icon: <WarningIcon />
  },
  'Bon performeur': {
    color: '#4CAF50',
    icon: <CheckCircleIcon />
  }
};

const PRIORITY_ICONS = {
  high: <ErrorIcon color="error" />,
  medium: <WarningIcon color="warning" />,
  low: <CheckCircleIcon color="success" />
};

const AdminRecommendations = () => {
  // États
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState({
    classes: false,
    recommendations: false
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [dataStatus, setDataStatus] = useState({
    hasData: false,
    isLoading: false,
    error: null
  });

  const theme = useTheme();

  // Constantes
  const API_ENDPOINTS = {
    CLASSES: '/api/classes/',
    RECOMMENDATIONS: '/api/ml/class-recommendations/'
  };

  // Effets
  useEffect(() => {
    fetchClasses();
  }, []);

  // Méthodes
  const fetchClasses = async () => {
    setLoading(prev => ({ ...prev, classes: true }));
    try {
      const response = await fetch(API_ENDPOINTS.CLASSES);
      if (!response.ok) throw new Error('Erreur de chargement des classes');
      setClasses(await response.json());
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  };

  const generateRecommendations = async () => {
    if (!selectedClass) {
      showNotification('Veuillez sélectionner une classe', 'error');
      return;
    }

    setDataStatus({ hasData: false, isLoading: true, error: null });
    setLoading(prev => ({ ...prev, recommendations: true }));
    
    try {
      const response = await fetch(API_ENDPOINTS.RECOMMENDATIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ class_id: selectedClass }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de génération des recommandations');
      }
      
      const result = await response.json();
      const hasData = result.recommendations && result.recommendations.length > 0;
      
      setRecommendations(result.recommendations || []);
      setDataStatus({
        hasData,
        isLoading: false,
        error: hasData ? null : 'Aucune recommandation générée (pas de notes disponibles?)'
      });
      
      showNotification(hasData 
        ? `${result.recommendations.length} recommandations générées` 
        : 'Aucune recommandation générée');
        
    } catch (error) {
      console.error('Generate recommendations error:', error);
      setDataStatus({
        hasData: false,
        isLoading: false,
        error: error.message
      });
      showNotification(error.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getCurrentClassName = () => {
    return classes.find(c => c.id === selectedClass)?.nom || 'Classe inconnue';
  };

  // Rendu
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Recommandations de Parcours
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Générez des recommandations personnalisées pour vos étudiants
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={2}
            sx={{ 
              height: 140, 
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total des Recommandations
                </Typography>
                <SchoolIcon 
                  fontSize="medium" 
                  sx={{ color: theme.palette.primary.main }} 
                />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                  {recommendations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recommandations générées
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Class Selection and Generate Button */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {/* Class Selection */}
          <Grid item xs={12} sm={8}>
            <FormControl fullWidth>
              <InputLabel>Classe</InputLabel>
              <Select
                value={selectedClass}
                label="Classe"
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={loading.classes}
              >
                <MenuItem value="">
                  <em>Sélectionner une classe</em>
                </MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={generateRecommendations}
              disabled={loading.recommendations || !selectedClass}
              fullWidth
              sx={{ height: '56px' }}
            >
              {loading.recommendations ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Générer les Recommandations"
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Loading indicator */}
      {loading.recommendations && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Message d'information */}
      {!dataStatus.isLoading && !dataStatus.hasData && selectedClass && (
        <Alert 
          severity="info"
          sx={{ mb: 3 }}
        >
          {dataStatus.error || 'Aucune recommandation générée. Veuillez vérifier que les notes sont saisies.'}
        </Alert>
      )}

      {/* Recommendations Table */}
      {dataStatus.hasData && recommendations.length > 0 && (
        <Card elevation={2}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Étudiant</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Performance</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Recommandations</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recommendations.map((rec, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Chip
                            label={rec.performance_category}
                            size="small"
                            sx={{
                              mr: 1,
                              backgroundColor: STATUS_CONFIG[rec.performance_category]?.color,
                              color: 'white'
                            }}
                          />
                          {rec.student_name}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {STATUS_CONFIG[rec.performance_category]?.icon}
                      </TableCell>
                      <TableCell>
                        <List dense>
                          {rec.recommendations?.map((item, i) => (
                            <ListItem key={i} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                {PRIORITY_ICONS[item.priority]}
                              </ListItemIcon>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {item.type}
                                </Typography>
                                <Typography variant="body2">
                                  {item.message}
                                </Typography>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
      >
        <Alert
          onClose={handleNotificationClose}
          // @ts-ignore
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminRecommendations;