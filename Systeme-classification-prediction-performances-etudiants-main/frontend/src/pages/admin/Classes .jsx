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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from "@mui/icons-material/School";

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nom: "",
    niveau: "",
    année_scolaire: "",
    enseignant_responsable_id: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [enseignants, setEnseignants] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Récupérer les classes et les enseignants depuis l'API
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
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des classes",
        severity: "error",
      });
    }
  };

  const fetchEnseignants = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/enseignants/");
      const data = await response.json();
      setEnseignants(data);
    } catch (error) {
      console.error("Error fetching enseignants:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des enseignants",
        severity: "error",
      });
    }
  };

  // Ouvrir le dialogue pour ajouter/modifier une classe
  const handleOpenDialog = (classe = null) => {
    if (classe) {
      setFormData({
        id: classe.id,
        nom: classe.nom,
        niveau: classe.niveau,
        année_scolaire: classe.année_scolaire,
        enseignant_responsable_id: classe.enseignant_responsable_id,
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        nom: "",
        niveau: "",
        année_scolaire: "",
        enseignant_responsable_id: null,
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  // Fermer le dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Gérer les changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Soumettre le formulaire (créer ou mettre à jour une classe)
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
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchClasses();
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

  // Supprimer une classe
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/classes/delete/${id}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchClasses();
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

  // Fermer la Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes && classes.length > 0 ? (
              classes.map((classe) => (
                <TableRow key={classe.id}>
                  <TableCell>{classe.nom}</TableCell>
                  <TableCell align="center">{classe.niveau}</TableCell>
                  <TableCell align="center">{classe.année_scolaire}</TableCell>
                  <TableCell align="center">
                    {enseignants.find((e) => e.id === classe.enseignant_responsable_id)?.nom || "Inconnu"}
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Aucune classe disponible
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
              <TextField
                name="niveau"
                label="Niveau"
                fullWidth
                value={formData.niveau}
                onChange={handleInputChange}
                required
              />
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
                  name="enseignant_responsable_id"
                  value={formData.enseignant_responsable_id || ""}
                  onChange={handleInputChange}
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
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Mettre à jour" : "Créer"}
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