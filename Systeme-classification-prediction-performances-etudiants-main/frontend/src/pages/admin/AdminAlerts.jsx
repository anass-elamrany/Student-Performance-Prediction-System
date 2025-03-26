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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  useTheme
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  NotificationImportant as AlertIcon,
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

const AdminAlerts = () => {
  // États
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState({
    classes: false,
    alerts: false
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
    ALERTS: '/api/ml/class-dashboard/'
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

  const generateAlerts = async () => {
    if (!selectedClass) {
      showNotification('Veuillez sélectionner une classe', 'error');
      return;
    }

    setDataStatus({ hasData: false, isLoading: true, error: null });
    setLoading(prev => ({ ...prev, alerts: true }));
    
    try {
      const response = await fetch(API_ENDPOINTS.ALERTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ class_id: selectedClass }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de génération des alertes');
      }
      
      const result = await response.json();
      const alerts = result.alerts || [];
      const hasData = alerts.length > 0;
      
      setAlerts(alerts);
      setDataStatus({
        hasData,
        isLoading: false,
        error: hasData ? null : 'Aucune alerte générée (pas de notes disponibles?)'
      });
      
      showNotification(hasData 
        ? `${alerts.length} alertes générées` 
        : 'Aucune alerte générée');
        
    } catch (error) {
      console.error('Generate alerts error:', error);
      setDataStatus({
        hasData: false,
        isLoading: false,
        error: error.message
      });
      showNotification(error.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, alerts: false }));
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
          Système d'Alerte
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Surveillez les performances de vos étudiants
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
                  Total des Alertes
                </Typography>
                <AlertIcon 
                  fontSize="medium" 
                  sx={{ color: theme.palette.primary.main }} 
                />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                  {alerts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Alertes générées
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sélection de classe */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Sélectionner une classe pour générer des alertes
        </Typography>
        <Grid container spacing={2}>
          {/* Class Selection */}
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={generateAlerts}
              disabled={loading.alerts || !selectedClass}
              fullWidth
              sx={{ height: '56px' }}
            >
              {loading.alerts ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Générer les Alertes"
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Message d'information */}
      {!dataStatus.isLoading && !dataStatus.hasData && selectedClass && (
        <Alert 
          severity="info"
          icon={<SchoolIcon />}
          sx={{ mb: 3 }}
        >
          {dataStatus.error || 'Aucune alerte générée. Veuillez vérifier que les notes sont saisies.'}
        </Alert>
      )}

      {/* Contenu principal */}
      {dataStatus.hasData && (
        <>
          {/* Statistiques */}
          {alerts.length > 0 && (
            <Card sx={{ mb: 3, bgcolor: 'error.light' }}>
              <CardContent>
                <Typography variant="h6" color="error.dark">
                  {alerts.length} Étudiant(s) à Risque - {getCurrentClassName()}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Alertes */}
          {alerts.length > 0 && (
            <Card elevation={2}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Étudiant</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Message d'Alerte</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Recommandations</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerts.map((alert, index) => (
                        <TableRow
                          key={index}
                          hover
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell>
                            <Typography fontWeight="bold">{alert.student_name}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={alert.performance_category}
                              icon={STATUS_CONFIG[alert.performance_category]?.icon}
                              sx={{
                                backgroundColor: STATUS_CONFIG[alert.performance_category]?.color,
                                color: 'white',
                                minWidth: 160
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {alert.alert_message}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <List dense>
                              {alert.recommendations?.map((rec, i) => (
                                <ListItem key={i} sx={{ py: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <WarningIcon color="error" fontSize="small" />
                                  </ListItemIcon>
                                  <Typography variant="body2">
                                    {rec}
                                  </Typography>
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
        </>
      )}

      {/* Notification */}
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

export default AdminAlerts;