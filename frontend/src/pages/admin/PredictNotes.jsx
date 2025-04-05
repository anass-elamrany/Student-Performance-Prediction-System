// @ts-ignore
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  TableSortLabel,
  Tooltip,
  Paper
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';

const PredictNotes = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('student_name');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/classes/');
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        setError('Erreur lors du chargement des classes');
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  const handlePredict = async () => {
    if (!selectedClass) {
      setError('Veuillez sélectionner une classe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/predict-grades/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ class_id: selectedClass }),
      });

      const result = await response.json();

      if (response.ok) {
        // Vérification finale des doublons
        const uniqueStudents = {};
        result.students.forEach(student => {
          if (!uniqueStudents[student.student_id]) {
            uniqueStudents[student.student_id] = student;
          }
        });
        setData({ ...result, students: Object.values(uniqueStudents) });
      } else {
        throw new Error(result.error || 'Erreur lors de la prédiction');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedStudents = data?.students?.sort((a, b) => {
    const aValue = orderBy === 'student_name' 
      ? a[orderBy]
      : orderBy.includes('mat_') 
        ? a[orderBy]?.note || 0 
        : a[orderBy] === 'N/A' ? 0 : a[orderBy];
    
    const bValue = orderBy === 'student_name' 
      ? b[orderBy]
      : orderBy.includes('mat_') 
        ? b[orderBy]?.note || 0 
        : b[orderBy] === 'N/A' ? 0 : b[orderBy];

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  }) || [];

  const getNoteColor = (note) => {
    if (note >= 16) return 'success.main';
    if (note >= 12) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
        Prédiction des Notes
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Moyennes réelles S1/S2 et prédictions S3/S4
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel id="class-select-label">Classe</InputLabel>
              <Select
                labelId="class-select-label"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Classe"
                startAdornment={<FilterListIcon color="action" sx={{ mr: 1 }} />}
              >
                <MenuItem value="">
                  <em>Toutes les classes</em>
                </MenuItem>
                {classes.map((classe) => (
                  <MenuItem key={classe.id} value={classe.id}>
                    {classe.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handlePredict}
              disabled={!selectedClass || loading}
              startIcon={loading ? <CircularProgress size={24} /> : <TrendingUpIcon />}
              sx={{ height: 56 }}
            >
              {loading ? 'Calcul en cours...' : 'Générer les résultats'}
            </Button>

            {data?.class_name && (
              <Chip
                label={`Classe: ${data.class_name}`}
                color="primary"
                sx={{ ml: 2, height: 32 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {data?.students ? (
        <Paper elevation={3} sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'student_name'}
                      // @ts-ignore
                      direction={order}
                      onClick={() => handleSort('student_name')}
                    >
                      <Typography fontWeight="bold">Étudiant</Typography>
                    </TableSortLabel>
                  </TableCell>

                  <TableCell align="center">
                    <TableSortLabel
                      active={orderBy === 's1_avg'}
                      // @ts-ignore
                      direction={order}
                      onClick={() => handleSort('s1_avg')}
                    >
                      <Tooltip title="Moyenne réelle calculée à partir des notes existantes">
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <Typography fontWeight="bold">Moy. S1</Typography>
                          <InfoIcon fontSize="small" sx={{ ml: 0.5 }} />
                        </Box>
                      </Tooltip>
                    </TableSortLabel>
                  </TableCell>

                  <TableCell align="center">
                    <TableSortLabel
                      active={orderBy === 's2_avg'}
                      // @ts-ignore
                      direction={order}
                      onClick={() => handleSort('s2_avg')}
                    >
                      <Tooltip title="Moyenne réelle calculée à partir des notes existantes">
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <Typography fontWeight="bold">Moy. S2</Typography>
                          <InfoIcon fontSize="small" sx={{ ml: 0.5 }} />
                        </Box>
                      </Tooltip>
                    </TableSortLabel>
                  </TableCell>

                  {data?.matieres?.map((matiere) => (
                    <TableCell key={matiere.id} align="center">
                      <TableSortLabel
                        active={orderBy === matiere.field_name}
                        // @ts-ignore
                        direction={order}
                        onClick={() => handleSort(matiere.field_name)}
                      >
                        <Tooltip title="Note prédite basée sur les performances S1/S2">
                          <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography fontWeight="bold">{matiere.nom}</Typography>
                            <Typography variant="caption">
                              S{matiere.semestre} (Coef. {matiere.coef})
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedStudents.map((student) => (
                  <TableRow key={student.student_id} hover>
                    <TableCell>
                      <Typography fontWeight="500">{student.student_name}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={student.s1_avg}
                        variant="outlined"
                        color={
                          student.s1_avg !== 'N/A'
                            ? student.s1_avg >= 12
                              ? 'success'
                              : 'error'
                            : 'default'
                        }
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={student.s2_avg}
                        variant="outlined"
                        color={
                          student.s2_avg !== 'N/A'
                            ? student.s2_avg >= 12
                              ? 'success'
                              : 'error'
                            : 'default'
                        }
                      />
                    </TableCell>

                    {data?.matieres?.map((matiere) => (
                      <TableCell key={`${student.student_id}_${matiere.id}`} align="center">
                        <Typography
                          fontWeight="bold"
                          sx={{
                            color: getNoteColor(student[matiere.field_name]?.note || 0),
                            fontSize: '1.1rem'
                          }}
                        >
                          {student[matiere.field_name]?.note?.toFixed(2) || '-'}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            textAlign: 'center',
            p: 4,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <SchoolIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {selectedClass
              ? "Cliquez sur 'Générer les résultats' pour afficher les prédictions"
              : "Veuillez sélectionner une classe"}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PredictNotes;