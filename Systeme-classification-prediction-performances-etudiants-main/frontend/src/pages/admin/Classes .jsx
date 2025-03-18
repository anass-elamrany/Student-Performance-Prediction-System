import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from "@mui/icons-material/School";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import SubjectIcon from "@mui/icons-material/Subject";

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nom: "",
    niveau: "",
    année_scolaire: "",
    enseignant_responsable: null,
    matières: [],
  });
  const [editMode, setEditMode] = useState(false);
  const [enseignants, setEnseignants] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openSubjectDialog, setOpenSubjectDialog] = useState(false);
  const [currentSubject, setCurrentSubject] = useState({
    id: null,
    nom: "",
    enseignant: null,
  });
  const fileInputRef = useRef(null);

  // Fetch classes and enseignants from the backend
  useEffect(() => {
    fetchClasses();
    fetchEnseignants();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/classes/");
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchEnseignants = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/enseignants/"); // Add this endpoint in Django
      const data = await response.json();
      setEnseignants(data);
    } catch (error) {
      console.error("Error fetching enseignants:", error);
    }
  };

  const handleOpenDialog = (classe = null) => {
    if (classe) {
      setFormData({
        id: classe.id,
        nom: classe.nom,
        niveau: classe.niveau,
        année_scolaire: classe.année_scolaire,
        enseignant_responsable: classe.enseignant_responsable,
        matières: classe.matières,
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        nom: "",
        niveau: "",
        année_scolaire: "",
        enseignant_responsable: null,
        matières: [],
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editMode
        ? `http://localhost:8000/api/classes/update/${formData.id}/`
        : "http://localhost:8000/api/classes/create/";
      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.nom,
          niveau: formData.niveau,
          année_scolaire: formData.année_scolaire,
          enseignant_responsable_id: formData.enseignant_responsable?.id,
          matières: formData.matières.map((m) => ({
            nom: m.nom,
            enseignant_id: m.enseignant?.id,
          })),
        }),
      });

      if (response.ok) {
        fetchClasses(); // Refresh the class list
        setSnackbar({
          open: true,
          message: editMode
            ? "Classe mise à jour avec succès"
            : "Classe créée avec succès",
          severity: "success",
        });
        handleCloseDialog();
      } else {
        throw new Error("Erreur lors de la requête");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/classes/delete/${id}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchClasses(); // Refresh the class list
        setSnackbar({
          open: true,
          message: "Classe supprimée avec succès",
          severity: "info",
        });
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenSubjectDialog = (subject = null) => {
    if (subject) {
      setCurrentSubject({
        id: subject.id,
        nom: subject.nom,
        enseignant: subject.enseignant,
      });
    } else {
      setCurrentSubject({
        id: null,
        nom: "",
        enseignant: null,
      });
    }
    setOpenSubjectDialog(true);
  };

  const handleCloseSubjectDialog = () => {
    setOpenSubjectDialog(false);
  };

  const handleSubjectInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSubject({
      ...currentSubject,
      [name]: value,
    });
  };

  const handleSubjectSubmit = () => {
    const newMatière = {
      ...currentSubject,
      id: currentSubject.id || Date.now(), // Use existing ID or create a new one
    };

    let updatedMatières;
    if (currentSubject.id) {
      // Edit mode
      updatedMatières = formData.matières.map((m) =>
        m.id === currentSubject.id ? newMatière : m
      );
    } else {
      // Create mode
      updatedMatières = [...formData.matières, newMatière];
    }

    setFormData({
      ...formData,
      matières: updatedMatières,
    });

    setOpenSubjectDialog(false);
  };

  const handleDeleteSubject = (id) => {
    const updatedMatières = formData.matières.filter((m) => m.id !== id);
    setFormData({
      ...formData,
      matières: updatedMatières,
    });
  };

  const semestres = ["Semestre 1", "Semestre 2", "Semestre 3", "Semestre 4"];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Gestion des Classes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouvelle Classe
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Total des Classes
                </Typography>
                <SchoolIcon color="primary" />
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {classes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nom de la Classe</TableCell>
              <TableCell align="center">Niveau</TableCell>
              <TableCell align="center">Année Scolaire</TableCell>
              <TableCell align="center">Enseignant Responsable</TableCell>
              <TableCell align="center">Matières</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((classe) => (
              <TableRow
                key={classe.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {classe.nom}
                </TableCell>
                <TableCell align="center">{classe.niveau}</TableCell>
                <TableCell align="center">{classe.année_scolaire}</TableCell>
                <TableCell align="center">
                  {classe.enseignant_responsable?.nom}
                </TableCell>
                <TableCell align="center">
                  {classe.matières.length > 0 ? (
                    <Chip
                      label={`${classe.matières.length} matière(s)`}
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Chip label="Aucune matière" color="default" variant="outlined" />
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(classe)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(classe.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue pour Ajouter/Modifier une classe */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Modifier la Classe" : "Créer une Nouvelle Classe"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nom"
                label="Nom de la Classe"
                fullWidth
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="niveau-label">Niveau</InputLabel>
                <Select
                  labelId="niveau-label"
                  name="niveau"
                  value={formData.niveau}
                  label="Niveau"
                  onChange={handleInputChange}
                >
                  {semestres.map((semestre) => (
                    <MenuItem key={semestre} value={semestre}>
                      {semestre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="année_scolaire"
                label="Année Scolaire"
                fullWidth
                value={formData.année_scolaire}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="enseignant-label">Enseignant Responsable</InputLabel>
                <Select
                  labelId="enseignant-label"
                  name="enseignant_responsable"
                  value={formData.enseignant_responsable?.id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enseignant_responsable: enseignants.find(
                        (e) => e.id === e.target.value
                      ),
                    })
                  }
                >
                  {enseignants.map((enseignant) => (
                    <MenuItem key={enseignant.id} value={enseignant.id}>
                      {enseignant.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  mt: 2,
                }}
              >
                <Typography variant="subtitle1">Matières de la classe</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenSubjectDialog()}
                >
                  Ajouter une matière
                </Button>
              </Box>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom de la matière</TableCell>
                      <TableCell>Enseignant</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.matières.length > 0 ? (
                      formData.matières.map((matière) => (
                        <TableRow key={matière.id}>
                          <TableCell>{matière.nom}</TableCell>
                          <TableCell>{matière.enseignant?.nom}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenSubjectDialog(matière)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSubject(matière.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          Aucune matière ajoutée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue pour Ajouter/Modifier une matière */}
      <Dialog open={openSubjectDialog} onClose={handleCloseSubjectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentSubject.id ? "Modifier la Matière" : "Ajouter une Matière"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="nom"
                label="Nom de la Matière"
                fullWidth
                value={currentSubject.nom}
                onChange={handleSubjectInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="enseignant-matiere-label">Enseignant</InputLabel>
                <Select
                  labelId="enseignant-matiere-label"
                  name="enseignant"
                  value={currentSubject.enseignant?.id || ""}
                  onChange={(e) =>
                    setCurrentSubject({
                      ...currentSubject,
                      enseignant: enseignants.find(
                        (ens) => ens.id === e.target.value
                      ),
                    })
                  }
                  required
                >
                  {enseignants.map((enseignant) => (
                    <MenuItem key={enseignant.id} value={enseignant.id}>
                      {enseignant.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubjectDialog}>Annuler</Button>
          <Button
            onClick={handleSubjectSubmit}
            variant="contained"
            disabled={!currentSubject.nom || !currentSubject.enseignant}
          >
            {currentSubject.id ? "Mettre à jour" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          // @ts-ignore
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminClasses;