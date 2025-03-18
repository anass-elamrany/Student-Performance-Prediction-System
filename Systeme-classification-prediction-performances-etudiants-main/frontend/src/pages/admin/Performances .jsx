import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SchoolIcon from '@mui/icons-material/School';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import RecommendIcon from '@mui/icons-material/Recommend';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AdminPerformance = () => {
  // State for filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('semester');
  
  // Recommendation states
  const [openRecommendations, setOpenRecommendations] = useState(false);
  const [recommendationTab, setRecommendationTab] = useState(0);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState({
    alerts: [],
    courses: [],
    interventions: [],
    predictions: []
  });
  
  // Pop-up notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Simulated data - in a real app, you would fetch this from your Django backend
  const [loading, setLoading] = useState(false);
  
  // Mock data for charts
  const performanceData = [
    { month: 'Jan', average: 76, predicted: 78 },
    { month: 'Feb', average: 74, predicted: 75 },
    { month: 'Mar', average: 78, predicted: 80 },
    { month: 'Apr', average: 80, predicted: 82 },
    { month: 'May', average: 79, predicted: 81 },
    { month: 'Jun', average: 82, predicted: 84 },
  ];
  
  const categoryDistribution = [
    { name: 'Excellents', value: 30, color: '#4CAF50' },
    { name: 'Bons', value: 45, color: '#2196F3' },
    { name: 'Moyens', value: 15, color: '#FFC107' },
    { name: 'À risque', value: 10, color: '#F44336' },
  ];
  
  const subjectsPerformance = [
    { subject: 'Mathématiques', average: 78, classAvg: 75 },
    { subject: 'Physique', average: 72, classAvg: 70 },
    { subject: 'Informatique', average: 85, classAvg: 82 },
    { subject: 'Langues', average: 80, classAvg: 78 },
    { subject: 'Sciences', average: 76, classAvg: 74 },
  ];
  
  const riskAnalysisData = [
    { category: 'Retards', count: 120 },
    { category: 'Absences', count: 85 },
    { category: 'Notes<10', count: 65 },
    { category: 'Comportement', count: 40 },
  ];
  
  // Sample students data for recommendations
  const studentsData = [
    { id: 1, name: 'Thomas Martin', class: 'Classe A', risk: 'high', subjects: { 'math': 8, 'physics': 9, 'info': 12 }, absences: 7 },
    { id: 2, name: 'Emma Bernard', class: 'Classe A', risk: 'medium', subjects: { 'math': 11, 'physics': 10, 'info': 15 }, absences: 3 },
    { id: 3, name: 'Hugo Dubois', class: 'Classe B', risk: 'high', subjects: { 'math': 7, 'physics': 8, 'info': 10 }, absences: 12 },
    { id: 4, name: 'Léa Moreau', class: 'Classe B', risk: 'low', subjects: { 'math': 16, 'physics': 14, 'info': 17 }, absences: 1 },
    { id: 5, name: 'Jules Petit', class: 'Classe C', risk: 'medium', subjects: { 'math': 12, 'physics': 9, 'info': 13 }, absences: 5 },
  ];
  
  // List of classes and subjects for filters
  const classes = [
    { id: 'all', name: 'Toutes les classes' },
    { id: 'class1', name: 'Classe A' },
    { id: 'class2', name: 'Classe B' },
    { id: 'class3', name: 'Classe C' },
  ];
  
  const subjects = [
    { id: 'all', name: 'Toutes les matières' },
    { id: 'math', name: 'Mathématiques' },
    { id: 'physics', name: 'Physique' },
    { id: 'info', name: 'Informatique' },
    { id: 'lang', name: 'Langues' },
    { id: 'science', name: 'Sciences' },
  ];
  
  const periods = [
    { id: 'all', name: 'Tous les semestres' },
    { id: 'semester1', name: 'Semestre 1' },
    { id: 'semester2', name: 'Semestre 2' },
    { id: 'semester3', name: 'Semestre 3' },
    { id: 'semester4', name: 'Semestre 4' },
  ];
  
  
  // Summary stats
  const stats = [
    { title: 'Moyenne générale', value: '14.5/20', icon: <AssessmentIcon color="primary" fontSize="large" />, trend: 'up' },
    { title: 'Étudiants à risque', value: '12', icon: <WarningIcon color="error" fontSize="large" />, trend: 'down' },
    { title: 'Taux de réussite prédit', value: '87%', icon: <TrendingUpIcon color="success" fontSize="large" />, trend: 'up' },
    { title: 'Meilleure classe', value: 'Classe A', icon: <SchoolIcon color="info" fontSize="large" />, trend: 'neutral' },
  ];
  
  // Function to generate recommendations based on student data
  const generateRecommendations = () => {
    setGeneratingRecommendations(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      // Generate recommendations but don't show dialog
      setGeneratingRecommendations(false);
      
      // Show success message
      setSnackbarMessage("Génération des recommandations a été faite avec succès.");
      setSnackbarOpen(true);
    }, 1500);
  };
  
  // Function to generate alerts
  const generateAlerts = () => {
    setGeneratingRecommendations(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      setGeneratingRecommendations(false);
      
      // Show success message
      setSnackbarMessage("Génération des alertes a été faite avec succès.");
      setSnackbarOpen(true);
    }, 1500);
  };
  
  // Handle tab change in recommendations dialog
  const handleTabChange = (_, newValue) => {
    setRecommendationTab(newValue);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Simulated fetch data effect
  useEffect(() => {
    // In a real app, you would fetch data based on filters
    setLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [selectedClass, selectedSubject, selectedPeriod]);
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Performances des Étudiants
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyse et prédiction des performances académiques
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Classe</InputLabel>
              <Select
                value={selectedClass}
                label="Classe"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Matière</InputLabel>
              <Select
                value={selectedSubject}
                label="Matière"
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {subjects.map((subj) => (
                  <MenuItem key={subj.id} value={subj.id}>{subj.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Période</InputLabel>
              <Select
                value={selectedPeriod}
                label="Période"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periods.map((period) => (
                  <MenuItem key={period.id} value={period.id}>{period.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth
              startIcon={<RecommendIcon />}
              onClick={generateRecommendations}
              disabled={generatingRecommendations}
            >
              {generatingRecommendations ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Générer Recommandations"
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  {stat.icon}
                  {stat.trend === 'up' && <TrendingUpIcon color="success" />}
                  {stat.trend === 'down' && <TrendingDownIcon color={stat.title.includes('risque') ? 'success' : 'error'} />}
                </Box>
                <Typography variant="h5" component="div">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Main Charts */}
      <Grid container spacing={4}>
        {/* Performance Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader title="Évolution des Performances" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[60, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      stroke="#2196F3" 
                      name="Moyenne réelle" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#FF9800" 
                      name="Prédiction" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader title="Répartition par Catégorie" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 350, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} étudiants`, 'Nombre']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Subject Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Performance par Matière" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subjectsPerformance}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    barSize={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="average" 
                      fill="#673AB7" 
                      name="Moyenne" 
                    />
                    <Bar 
                      dataKey="classAvg" 
                      fill="#9C27B0" 
                      name="Moyenne de la classe" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Risk Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Analyse des Facteurs de Risque" 
              action={
                <Button 
                  color="error" 
                  variant="contained" 
                  size="small"
                  startIcon={<NotificationsIcon />}
                  onClick={generateAlerts}
                  disabled={generatingRecommendations}
                >
                  {generatingRecommendations ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    "Générer Alertes"
                  )}
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                Les facteurs de risque sont analysés pour identifier les étudiants nécessitant une attention particulière.
              </Alert>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={riskAnalysisData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    barSize={40}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      fill="#F44336" 
                      name="Nombre d'occurrences" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Success Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          sx={{ width: '100%', display: 'flex', alignItems: 'center' }}
          icon={<CheckCircleIcon fontSize="inherit" />}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Recommendations Dialog (keeping the existing dialog for reference) */}
      <Dialog 
        open={openRecommendations} 
        onClose={() => setOpenRecommendations(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RecommendIcon sx={{ mr: 1 }} />
            Recommandations et Analyses Prédictives
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={recommendationTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<WarningIcon />} label="Alertes" />
              <Tab icon={<SchoolOutlinedIcon />} label="Cours Recommandés" />
              <Tab icon={<PersonIcon />} label="Interventions" />
              <Tab icon={<TimelineIcon />} label="Prédictions" />
            </Tabs>
          </Box>
          
          {/* Alerts Tab */}
          {recommendationTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Alertes pour les Étudiants à Risque
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {recommendations.alerts.length === 0 ? (
                <Alert severity="success">Aucune alerte détectée.</Alert>
              ) : (
                <List>
                  {recommendations.alerts.map((alert, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <WarningIcon color={alert.severity === 'high' ? 'error' : 'warning'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {alert.name} 
                            <Chip 
                              size="small" 
                              label={alert.class} 
                              color="primary" 
                              variant="outlined" 
                            />
                            <Chip 
                              size="small" 
                              label={alert.type === 'absence' ? 'Absence' : 'Performance'} 
                              color={alert.severity === 'high' ? 'error' : 'warning'} 
                            />
                          </Box>
                        }
                        secondary={alert.message}
                      />
                      <Button variant="outlined" size="small">
                        Intervenir
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
          
          {/* Course Recommendations Tab */}
          {recommendationTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Recommandations de Cours
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {recommendations.courses.length === 0 ? (
                <Alert severity="info">Aucune recommandation de cours disponible.</Alert>
              ) : (
                <List>
                  {recommendations.courses.map((course, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <SchoolOutlinedIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {course.name}
                            <Chip size="small" label={course.class} color="primary" variant="outlined" />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {course.recommendedCourses.map((rec, idx) => (
                              <Box key={idx} sx={{ mb: 1 }}>
                                <Chip 
                                  size="small" 
                                  label={rec.subject} 
                                  color="secondary" 
                                  sx={{ mr: 1 }} 
                                />
                                <Typography variant="body2" component="span">
                                  {rec.type} - {rec.reason}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        }
                      />
                      <Button variant="outlined" size="small" color="secondary">
                        Assigner
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
          
          {/* Interventions Tab */}
          {recommendationTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Interventions Recommandées
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {recommendations.interventions.length === 0 ? (
                <Alert severity="info">Aucune intervention recommandée.</Alert>
              ) : (
                <List>
                  {recommendations.interventions.map((intervention, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <PersonIcon color={intervention.risk === 'high' ? 'error' : 'warning'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {intervention.name}
                            <Chip size="small" label={intervention.class} color="primary" variant="outlined" />
                            <Chip 
                              size="small" 
                              label={intervention.risk === 'high' ? 'Risque élevé' : 'Risque moyen'} 
                              color={intervention.risk === 'high' ? 'error' : 'warning'} 
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {intervention.recommendations.map((rec, idx) => (
                              <Typography key={idx} variant="body2" component="li">
                                {rec}
                              </Typography>
                            ))}
                          </Box>
                        }
                      />
                      <Button variant="outlined" size="small" color="primary">
                        Planifier
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
          
          {/* Predictions Tab */}
          {recommendationTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Prédictions et Tendances
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {recommendations.predictions.length === 0 ? (
                <Alert severity="info">Aucune prédiction disponible.</Alert>
              ) : (
                <List>
                  {recommendations.predictions.map((prediction, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <TimelineIcon color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {prediction.class}
                            <Chip 
                              size="small" 
                              label={`Confiance: ${prediction.confidence}%`} 
                              color="info" 
                              variant="outlined" 
                            />
                          </Box>
                        }
                        secondary={prediction.prediction}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Les prédictions sont basées sur des modèles d'apprentissage automatique qui analysent les tendances historiques et les performances actuelles.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRecommendations(false)}>Fermer</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setOpenRecommendations(false)}
          >
            Appliquer Recommandations
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPerformance;