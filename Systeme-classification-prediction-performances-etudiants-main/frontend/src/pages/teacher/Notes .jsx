import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Snackbar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const TeacherNotes = () => {
  // State variables
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [absenceDialogOpen, setAbsenceDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentGrade, setCurrentGrade] = useState('');
  const [currentProjectGrade, setCurrentProjectGrade] = useState('');
  const [currentAbsenceCount, setCurrentAbsenceCount] = useState(0);
  const [absenceJustification, setAbsenceJustification] = useState('');
  const [comment, setComment] = useState('');
  const [projectComment, setProjectComment] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [tabValue, setTabValue] = useState(0);
  
  // Mock data
  const [loading, setLoading] = useState(false);
  
  // Classes, subjects, and assessments for filters
  const classes = [
    { id: 'class1', name: 'Terminale S1' },
    { id: 'class2', name: 'Terminale S2' },
    { id: 'class3', name: 'Première S1' },
  ];
  
  const subjects = [
    { id: 'math', name: 'Mathématiques' },
    { id: 'physics', name: 'Physique' },
    { id: 'info', name: 'Informatique' },
    { id: 'lang', name: 'Langues' },
  ];
  
  const semesters = [
    { id: 'sem1', name: 'Semestre 1' },
    { id: 'sem2', name: 'Semestre 2' },
    { id: 'sem3', name: 'Semestre 3' },
    { id: 'sem4', name: 'Semestre 4' },
  ];
  
  const assessments = [
    { id: 'exam1', name: 'Examen Semestre 1', date: '10/12/2024', type: 'exam' },
    { id: 'quiz1', name: 'Contrôle 1', date: '15/01/2025', type: 'quiz' },
    { id: 'project1', name: 'Projet Groupe', date: '01/02/2025', type: 'project' },
    { id: 'quiz2', name: 'Contrôle 2', date: '01/03/2025', type: 'quiz' },
  ];
  
  // Student grades
  const studentGrades = [
    { id: 1, lastName: 'Martin', firstName: 'Sophie', studentId: 'S001', grade: 16.5, projectGrade: 18, status: 'validated', absenceCount: 2, absenceJustified: 1, avatar: 'SM' },
    { id: 2, lastName: 'Dubois', firstName: 'Thomas', studentId: 'S002', grade: 12, projectGrade: 14.5, status: 'validated', absenceCount: 5, absenceJustified: 2, avatar: 'TD' },
    { id: 3, lastName: 'Laurent', firstName: 'Marie', studentId: 'S003', grade: 8.5, projectGrade: 11, status: 'at_risk', absenceCount: 8, absenceJustified: 3, avatar: 'ML' },
    { id: 4, lastName: 'Bernard', firstName: 'Lucas', studentId: 'S004', grade: 14, projectGrade: 15, status: 'validated', absenceCount: 1, absenceJustified: 1, avatar: 'LB' },
    { id: 5, lastName: 'Petit', firstName: 'Emma', studentId: 'S005', grade: 17.5, projectGrade: 19, status: 'excellent', absenceCount: 0, absenceJustified: 0, avatar: 'EP' },
    { id: 6, lastName: 'Roux', firstName: 'Léa', studentId: 'S006', grade: 11, projectGrade: 13, status: 'validated', absenceCount: 3, absenceJustified: 2, avatar: 'LR' },
    { id: 7, lastName: 'Moreau', firstName: 'Jules', studentId: 'S007', grade: 9, projectGrade: 10, status: 'at_risk', absenceCount: 4, absenceJustified: 1, avatar: 'JM' },
    { id: 8, lastName: 'Simon', firstName: 'Camille', studentId: 'S008', grade: 15, projectGrade: 16, status: 'validated', absenceCount: 1, absenceJustified: 1, avatar: 'CS' },
    { id: 9, lastName: 'Michel', firstName: 'Antoine', studentId: 'S009', grade: 18, projectGrade: 17.5, status: 'excellent', absenceCount: 0, absenceJustified: 0, avatar: 'AM' },
    { id: 10, lastName: 'Lefebvre', firstName: 'Chloé', studentId: 'S010', grade: 13.5, projectGrade: 14, status: 'validated', absenceCount: 2, absenceJustified: 2, avatar: 'CL' },
    { id: 11, lastName: 'Garcia', firstName: 'Hugo', studentId: 'S011', grade: 10, projectGrade: 12, status: 'at_risk', absenceCount: 6, absenceJustified: 2, avatar: 'HG' },
    { id: 12, lastName: 'Dupont', firstName: 'Inès', studentId: 'S012', grade: 15.5, projectGrade: 15.5, status: 'validated', absenceCount: 1, absenceJustified: 1, avatar: 'ID' },
  ];
  
  // Grade history for a student
  const gradeHistory = [
    { date: '10/12/2024', assessment: 'Examen Semestre 1', grade: 15, type: 'exam', comment: 'Bon travail, mais peut mieux faire sur la partie algèbre.' },
    { date: '15/01/2025', assessment: 'Contrôle 1', grade: 17, type: 'quiz', comment: 'Excellente maîtrise des concepts.' },
    { date: '01/02/2025', assessment: 'Projet Groupe', grade: 16, type: 'project', comment: 'Très bonne contribution au projet d\'équipe.' },
    { date: '01/03/2025', assessment: 'Contrôle 2', grade: 14.5, type: 'quiz', comment: 'Quelques difficultés avec les nouvelles notions.' },
  ];
  
  // Absence history for a student
  const absenceHistory = [
    { date: '05/12/2024', status: 'Justified', reason: 'Certificat médical' },
    { date: '12/01/2025', status: 'Unjustified', reason: '' },
    { date: '03/02/2025', status: 'Justified', reason: 'Événement familial' },
  ];
  
  // Statistics data
  const gradeDistribution = [
    { range: '0-5', count: 0 },
    { range: '5-10', count: 3 },
    { range: '10-15', count: 6 },
    { range: '15-20', count: 3 },
  ];
  
  const progressData = [
    { month: 'Sept', average: 12.3 },
    { month: 'Oct', average: 13.1 },
    { month: 'Nov', average: 12.8 },
    { month: 'Dec', average: 13.5 },
    { month: 'Jan', average: 14.2 },
    { month: 'Fév', average: 13.9 },
  ];
  
  // Simulated fetch data effect
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [selectedClass, selectedSubject, selectedSemester, selectedAssessment]);
  
  // Handle grade edit
  const handleEditGrade = (student) => {
    setSelectedStudent(student);
    setCurrentGrade(student.grade.toString());
    setComment('');
    setGradeDialogOpen(true);
  };
  
  // Handle project grade edit
  const handleEditProjectGrade = (student) => {
    setSelectedStudent(student);
    setCurrentProjectGrade(student.projectGrade.toString());
    setProjectComment('');
    setProjectDialogOpen(true);
  };
  
  // Handle absence edit
  const handleEditAbsence = (student) => {
    setSelectedStudent(student);
    setCurrentAbsenceCount(student.absenceCount);
    setAbsenceJustification('');
    setAbsenceDialogOpen(true);
  };
  
  // Handle grade history view
  const handleViewHistory = (student) => {
    setSelectedStudent(student);
    setHistoryDialogOpen(true);
  };
  
  // Handle grade save
  const handleSaveGrade = () => {
    // In a real app, you would make an API call to save the grade
    setSnackbarMessage(`Note mise à jour pour ${selectedStudent.firstName} ${selectedStudent.lastName}`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setGradeDialogOpen(false);
  };
  
  // Handle project grade save
  const handleSaveProjectGrade = () => {
    setSnackbarMessage(`Note de projet mise à jour pour ${selectedStudent.firstName} ${selectedStudent.lastName}`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setProjectDialogOpen(false);
  };
  
  // Handle absence save
  const handleSaveAbsence = () => {
    setSnackbarMessage(`Absences mises à jour pour ${selectedStudent.firstName} ${selectedStudent.lastName}`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setAbsenceDialogOpen(false);
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Filter students based on search term
  const filteredStudents = studentGrades.filter(
    (student) => 
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return '#4CAF50';
      case 'validated':
        return '#2196F3';
      case 'at_risk':
        return '#F44336';
      default:
        return '#757575';
    }
  };
  
  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'excellent':
        return 'Excellent';
      case 'validated':
        return 'Validé';
      case 'at_risk':
        return 'En difficulté';
      default:
        return 'Non évalué';
    }
  };
  
  const getAssessmentIcon = (type) => {
    switch (type) {
      case 'exam':
        return <AssignmentIcon fontSize="small" />;
      case 'quiz':
        return <AssignmentIcon fontSize="small" />;
      case 'project':
        return <AssignmentIcon fontSize="small" color="secondary" />;
      default:
        return <AssignmentIcon fontSize="small" />;
    }
  };
  
  return (
    <Box sx={{ minHeight: '100vh', p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'medium', color: '#1976d2' }}>
          Gestion des Notes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Saisissez et analysez les notes des élèves
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Semestre</InputLabel>
              <Select
                value={selectedSemester}
                label="Semestre"
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                {semesters.map((sem) => (
                  <MenuItem key={sem.id} value={sem.id}>{sem.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              disabled={!selectedClass || !selectedSubject || !selectedSemester}
              sx={{ height: '100%', bgcolor: '#1976d2' }}
            >
              Filtrer
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs for different views */}
      <Paper elevation={3} sx={{ borderRadius: 2, mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Notes des Élèves" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Statistiques" icon={<AssignmentIcon />} iconPosition="start" />
          <Tab label="Absences" icon={<EventBusyIcon />} iconPosition="start" />
        </Tabs>
      </Paper>
      
      {/* Tab content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'medium', color: '#1976d2' }}>
                  Notes des Élèves
                </Typography>
        

              </Box>
              <TextField
                fullWidth
                placeholder="Rechercher un élève..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Étudiant</TableCell>
                      <TableCell align="center">ID</TableCell>
                      <TableCell align="center">Note /20</TableCell>
                      <TableCell align="center">Note Projet</TableCell>
                      <TableCell align="center">Statut</TableCell>
                      <TableCell align="center">Absences</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((student) => (
                        <TableRow 
                          key={student.id} 
                          hover
                          sx={{ 
                            '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                            '&:hover': { bgcolor: '#f0f7ff' } 
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                sx={{ 
                                  mr: 2, 
                                  bgcolor: getStatusColor(student.status) 
                                }}
                              >
                                {student.avatar}
                              </Avatar>
                              <Typography>
                                {student.lastName} {student.firstName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">{student.studentId}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            {student.grade}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: '#7e57c2' }}>
                            {student.projectGrade}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={getStatusLabel(student.status)} 
                              size="small"
                              sx={{ 
                                bgcolor: getStatusColor(student.status),
                                color: 'white'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={`${student.absenceJustified} justifiées sur ${student.absenceCount}`}>
                              <Chip 
                                label={`${student.absenceCount}`} 
                                size="small"
                                color={student.absenceCount > 5 ? "error" : student.absenceCount > 2 ? "warning" : "default"}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Modifier la note">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleEditGrade(student)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier note de projet">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={() => handleEditProjectGrade(student)}
                              >
                                <AssignmentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Gérer les absences">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditAbsence(student)}
                                sx={{ color: '#ff9800' }}
                              >
                                <EventBusyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Historique des notes">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewHistory(student)}
                                sx={{ color: '#607d8b' }}
                              >
                                <HistoryIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredStudents.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes par page:"
              />
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', color: '#1976d2' }}>
                Distribution des Notes
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={gradeDistribution}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar 
                      dataKey="count" 
                      fill="#3F51B5" 
                      name="Élèves" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                  Statistiques
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Moyenne de classe:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold">
                      13.5/20
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Médiane:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold">
                      14/20
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Meilleure note:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold">
                      18/20
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Note la plus basse:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold">
                      8.5/20
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', color: '#1976d2' }}>
                Évolution des Moyennes
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={progressData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[8, 16]} />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                      name="Moyenne" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                  Comparaison par Semestres
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Semestre 1:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold">
                      12.8/20
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Semestre 2:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold">
                      13.9/20
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Progression:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      +8.6%
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'medium', color: '#1976d2' }}>
                  Gestion des Absences
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Étudiant</TableCell>
                      <TableCell align="center">ID</TableCell>
                      <TableCell align="center">Total Absences</TableCell>
                      <TableCell align="center">Absences Justifiées</TableCell>
                      <TableCell align="center">Absences Non Justifiées</TableCell>
                      <TableCell align="center">% Présence</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((student) => {
                        const presencePercentage = Math.round(((20 - student.absenceCount) / 20) * 100);
                        return (
                          <TableRow 
                            key={student.id} 
                            hover
                            sx={{ 
                              '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                              '&:hover': { bgcolor: '#f0f7ff' } 
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{ 
                                    mr: 2, 
                                    bgcolor: 
                                      student.absenceCount > 5 
                                        ? '#F44336' 
                                        : student.absenceCount > 2 
                                          ? '#FF9800' 
                                          : '#4CAF50' 
                                  }}
                                >
                                  {student.avatar}
                                </Avatar>
                                <Typography>
                                  {student.lastName} {student.firstName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">{student.studentId}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                              {student.absenceCount}
                            </TableCell>
                            <TableCell align="center">
                              {student.absenceJustified}
                            </TableCell>
                            <TableCell align="center" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                              {student.absenceCount - student.absenceJustified}
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={`${presencePercentage}%`} 
                                size="small"
                                color={
                                  presencePercentage < 75 
                                    ? "error" 
                                    : presencePercentage < 90 
                                      ? "warning" 
                                      : "success"
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Gérer les absences">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditAbsence(student)}
                                  sx={{ color: '#ff9800' }}
                                >
                                  <EventBusyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Historique des absences">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewHistory(student)}
                                  sx={{ color: '#607d8b' }}
                                >
                                  <HistoryIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredStudents.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes par page:"
              />
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Grade Edit Dialog */}
      <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Modifier la note de {selectedStudent?.firstName} {selectedStudent?.lastName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <TextField
              label="Note /20"
              type="number"
              fullWidth
              value={currentGrade}
              onChange={(e) => setCurrentGrade(e.target.value)}
              inputProps={{ min: 0, max: 20, step: 0.5 }}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              label="Commentaire"
              multiline
              rows={4}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Commentaire sur le travail de l'élève..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleSaveGrade} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Project Grade Edit Dialog */}
      <Dialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Modifier la note de projet de {selectedStudent?.firstName} {selectedStudent?.lastName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <TextField
              label="Note Projet /20"
              type="number"
              fullWidth
              value={currentProjectGrade}
              onChange={(e) => setCurrentProjectGrade(e.target.value)}
              inputProps={{ min: 0, max: 20, step: 0.5 }}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              label="Commentaire"
              multiline
              rows={4}
              fullWidth
              value={projectComment}
              onChange={(e) => setProjectComment(e.target.value)}
              placeholder="Commentaire sur le projet de l'élève..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectDialogOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleSaveProjectGrade} 
            variant="contained" 
            startIcon={<SaveIcon />}
            color="secondary"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Absence Edit Dialog */}
      <Dialog open={absenceDialogOpen} onClose={() => setAbsenceDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Gérer les absences de {selectedStudent?.firstName} {selectedStudent?.lastName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Total Absences"
                  type="number"
                  fullWidth
                  value={currentAbsenceCount}
                  onChange={(e) => setCurrentAbsenceCount(parseInt(e.target.value))}
                  inputProps={{ min: 0 }}
                  sx={{ mb: 2, mt: 1 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Absences Justifiées"
                  type="number"
                  fullWidth
                  inputProps={{ 
                    min: 0, 
                    max: currentAbsenceCount 
                  }}
                  value={selectedStudent?.absenceJustified || 0}
                  disabled
                  sx={{ mb: 2, mt: 1 }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Justification"
              multiline
              rows={3}
              fullWidth
              value={absenceJustification}
              onChange={(e) => setAbsenceJustification(e.target.value)}
              placeholder="Ajouter une justification pour les absences..."
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Type de Justification</InputLabel>
              <Select
                value=""
                label="Type de Justification"
              >
                <MenuItem value="medical">Certificat Médical</MenuItem>
                <MenuItem value="family">Raison Familiale</MenuItem>
                <MenuItem value="administrative">Démarche Administrative</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbsenceDialogOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleSaveAbsence} 
            variant="contained" 
            startIcon={<SaveIcon />}
            color="warning"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Historique de {selectedStudent?.firstName} {selectedStudent?.lastName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Tabs value={0} aria-label="historique tabs">
              <Tab label="Notes" />
              <Tab label="Absences" />
            </Tabs>
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Date</TableCell>
                    <TableCell>Évaluation</TableCell>
                    <TableCell align="center">Type</TableCell>
                    <TableCell align="center">Note</TableCell>
                    <TableCell>Commentaire</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gradeHistory.map((entry, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getAssessmentIcon(entry.type)}
                          <Typography sx={{ ml: 1 }}>
                            {entry.assessment}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={entry.type === 'exam' ? 'Examen' : entry.type === 'quiz' ? 'Contrôle' : 'Projet'} 
                          size="small"
                          color={entry.type === 'exam' ? 'primary' : entry.type === 'quiz' ? 'default' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {entry.grade}/20
                      </TableCell>
                      <TableCell>{entry.comment}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          // @ts-ignore
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherNotes;