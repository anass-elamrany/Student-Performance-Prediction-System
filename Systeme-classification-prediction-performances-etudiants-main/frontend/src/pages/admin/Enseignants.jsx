import React, { useState, useEffect } from "react";
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
  IconButton,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import ClassIcon from "@mui/icons-material/Class";

const AdminEnseignants = () => {
  const [enseignants, setEnseignants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nom: "",
    prénom: "",
    email: "",
    téléphone: "",
    affectations: [], // Structure: [{classe: "Classe A", matière: "Mathématiques"}]
  });
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [matières, setMatières] = useState([]); // Récupéré depuis l'API
  const [classes, setClasses] = useState([]); // Récupéré depuis l'API
  const [affectationForm, setAffectationForm] = useState({
    classe: "",
    matière: "",
  });

  // Récupérer les enseignants depuis l'API
  const fetchEnseignants = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/enseignants/");
      const data = await response.json();
      setEnseignants(data);
    } catch (error) {
      console.error("Error fetching enseignants:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des données",
        severity: "error",
      });
    }
  };

  // Récupérer les classes depuis l'API
  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/classes/list/");
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des classes",
        severity: "error",
      });
    }
  };

  // Récupérer les matières depuis l'API
  const fetchMatieres = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/matieres/list/");
      const data = await response.json();
      setMatières(data);
    } catch (error) {
      console.error("Error fetching matières:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des matières",
        severity: "error",
      });
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchEnseignants();
    fetchClasses();
    fetchMatieres();
  }, []);

  // Ouvrir le dialogue pour ajouter/modifier un enseignant
  const handleOpenDialog = (enseignant = null) => {
    if (enseignant) {
      setFormData({
        id: enseignant.id,
        nom: enseignant.nom,
        prénom: enseignant.prénom,
        email: enseignant.email,
        téléphone: enseignant.téléphone,
        affectations: [...enseignant.affectations],
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        nom: "",
        prénom: "",
        email: "",
        téléphone: "",
        affectations: [],
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  // Fermer le dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAffectationForm({ classe: "", matière: "" });
  };

  // Gérer les changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Gérer les changements dans le formulaire d'affectation
  const handleAffectationChange = (e) => {
    const { name, value } = e.target;
    setAffectationForm({
      ...affectationForm,
      [name]: value,
    });
  };

  // Ajouter une affectation
  const handleAddAffectation = () => {
    if (affectationForm.classe && affectationForm.matière) {
      const exists = formData.affectations.some(
        (a) =>
          a.classe === affectationForm.classe &&
          a.matière === affectationForm.matière
      );
      if (!exists) {
        setFormData({
          ...formData,
          affectations: [...formData.affectations, { ...affectationForm }],
        });
        setAffectationForm({ classe: "", matière: "" });
      } else {
        setSnackbar({
          open: true,
          message: "Cette affectation existe déjà",
          severity: "warning",
        });
      }
    }
  };

  // Supprimer une affectation
  const handleRemoveAffectation = (index) => {
    const updatedAffectations = [...formData.affectations];
    updatedAffectations.splice(index, 1);
    setFormData({
      ...formData,
      affectations: updatedAffectations,
    });
  };

  // Soumettre le formulaire (créer ou mettre à jour un enseignant)
  const handleSubmit = async () => {
    try {
      const url = editMode
        ? `http://localhost:8000/api/enseignants/update/${formData.id}/`
        : "http://localhost:8000/api/enseignants/create/";
      const method = editMode ? "PUT" : "POST";
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.nom,
          prénom: formData.prénom,
          email: formData.email,
          téléphone: formData.téléphone,
          affectations: formData.affectations,
        }),
      });
      if (response.ok) {
        fetchEnseignants();
        setSnackbar({
          open: true,
          message: editMode
            ? "Enseignant mis à jour avec succès"
            : "Enseignant ajouté avec succès",
          severity: "success",
        });
        handleCloseDialog();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erreur lors de l'enregistrement",
        severity: "error",
      });
    }
  };

  // Supprimer un enseignant
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/enseignants/delete/${id}/`,
        { method: "DELETE" }
      );
      if (response.ok) {
        fetchEnseignants();
        setSnackbar({
          open: true,
          message: "Enseignant supprimé avec succès",
          severity: "info",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression",
        severity: "error",
      });
    }
  };

  // Fermer la Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Obtenir les matières uniques d'un enseignant
  const getMatieresUniques = (affectations) => {
    const matieres = new Set(affectations.map((a) => a.matière));
    return Array.from(matieres);
  };

  // Obtenir les classes uniques d'un enseignant
  const getClassesUniques = (affectations) => {
    const classes = new Set(affectations.map((a) => a.classe));
    return Array.from(classes);
  };

  return (
    <Box>
      {/* En-tête */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Gestion des Enseignants
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouvel Enseignant
        </Button>
      </Box>

      {/* Cartes de statistiques */}
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
                  Total des Enseignants
                </Typography>
                <PersonIcon color="primary" fontSize="large" />
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {enseignants.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
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
                <ClassIcon color="secondary" fontSize="large" />
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {classes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau des enseignants */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Enseignant</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">Téléphone</TableCell>
              <TableCell align="center">Matières</TableCell>
              <TableCell align="center">Classes</TableCell>
              <TableCell align="center">Affectations</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enseignants.map((enseignant) => (
              <TableRow
                key={enseignant.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography>
                      {enseignant.prénom} {enseignant.nom}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">{enseignant.email}</TableCell>
                <TableCell align="center">{enseignant.téléphone}</TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      justifyContent: "center",
                    }}
                  >
                    {getMatieresUniques(enseignant.affectations).map((matière) => (
                      <Chip
                        key={matière}
                        label={matière}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      justifyContent: "center",
                    }}
                  >
                    {getClassesUniques(enseignant.affectations).map((classe) => (
                      <Chip
                        key={classe}
                        label={classe}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      alignItems: "center",
                    }}
                  >
                    {enseignant.affectations.map((affectation, index) => (
                      <Typography key={index} variant="body2">
                        {affectation.matière} → {affectation.classe}
                      </Typography>
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(enseignant)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(enseignant.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue pour Ajouter/Modifier un enseignant */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Modifier l'Enseignant" : "Ajouter un Enseignant"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nom"
                label="Nom"
                fullWidth
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="prénom"
                label="Prénom"
                fullWidth
                value={formData.prénom}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="téléphone"
                label="Téléphone"
                fullWidth
                value={formData.téléphone}
                onChange={handleInputChange}
                required
              />
            </Grid>

            {/* Section d'affectation des classes et matières */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Affectations (Classe - Matière)
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel id="classe-label">Classe</InputLabel>
                    <Select
                      labelId="classe-label"
                      name="classe"
                      value={affectationForm.classe}
                      onChange={handleAffectationChange}
                    >
                      {classes.map((classe) => (
                        <MenuItem key={classe} value={classe}>
                          {classe}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel id="matiere-label">Matière</InputLabel>
                    <Select
                      labelId="matiere-label"
                      name="matière"
                      value={affectationForm.matière}
                      onChange={handleAffectationChange}
                    >
                      {matières.map((matière) => (
                        <MenuItem key={matière} value={matière}>
                          {matière}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ height: "100%" }}
                    onClick={handleAddAffectation}
                    disabled={!affectationForm.classe || !affectationForm.matière}
                  >
                    Ajouter
                  </Button>
                </Grid>
              </Grid>

              {/* Liste des affectations existantes */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Affectations actuelles:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {formData.affectations.length > 0 ? (
                    <Grid container spacing={1}>
                      {formData.affectations.map((aff, index) => (
                        <Grid item xs={12} key={index}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography>
                              {aff.matière} → {aff.classe}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveAffectation(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography color="text.secondary">
                      Aucune affectation. Veuillez ajouter au moins une affectation classe-matière.
                    </Typography>
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formData.affectations.length === 0}
          >
            {editMode ? "Mettre à jour" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
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

export default AdminEnseignants;