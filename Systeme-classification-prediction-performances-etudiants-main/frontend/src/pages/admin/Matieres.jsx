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
import FilterListIcon from "@mui/icons-material/FilterList";
import CloudUploadIcon from "@mui/icons-material/CloudUpload"; // Import CloudUploadIcon
import GetAppIcon from "@mui/icons-material/GetApp"; // Import GetAppIcon

const AdminMatieres = () => {
  const [matieres, setMatieres] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nom: "",
    coefficient: "",
    semestre: "",
    classe: null,
    enseignant: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [classes, setClasses] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [filters, setFilters] = useState({
    semestre: "",
    classe: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch matieres, classes, and enseignants from the backend
  useEffect(() => {
    fetchMatieres();
    fetchClasses();
    fetchEnseignants();
  }, []);

  const fetchMatieres = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/matieres/");
      const data = await response.json();
      setMatieres(data);
    } catch (error) {
      console.error("Error fetching matieres:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des matières",
        severity: "error",
      });
    }
  };

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

  // Handle CSV file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file); // Ensure the key matches the server's expectation
  
    try {
      const response = await fetch("http://localhost:8000/api/matieres/import/", {
        method: "POST",
        body: formData, // No need to set headers for FormData
      });
  
      if (response.ok) {
        fetchMatieres(); // Refresh the list of matieres
        setSnackbar({
          open: true,
          message: "Matieres importés avec succès",
          severity: "success",
        });
      } else {
        const errorData = await response.json(); // Parse the server's error response
        console.error("Server Error:", errorData);
        throw new Error(errorData.error || "Erreur lors de l'importation du fichier CSV");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setSnackbar({
        open: true,
        message: error.message || "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  // Handle downloading the CSV template
  const downloadTemplate = () => {
    const headers = ["Nom", "Coefficient", "Semestre", "Classe", "Email"];
    let csvContent = headers.join(",") + "\n";

    // If there are matieres, add their data to the CSV content
    if (matieres.length > 0) {
        matieres.forEach((matiere) => {
            const row = [
                matiere.nom,
                matiere.coefficient,
                matiere.semestre,
                matiere.classe?.nom || "Inconnu",
                matiere.enseignant?.email || "Inconnu",
            ];
            csvContent += row.join(",") + "\n";
        });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_matieres.csv";
    link.click();
    URL.revokeObjectURL(url);
};
  // Open dialog for adding/editing a matiere
  const handleOpenDialog = (matiere = null) => {
    if (matiere) {
      setFormData({
        id: matiere.id,
        nom: matiere.nom,
        coefficient: matiere.coefficient,
        semestre: matiere.semestre,
        classe: matiere.classe?.id || null,
        enseignant: matiere.enseignant?.id || null,
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        nom: "",
        coefficient: "",
        semestre: "",
        classe: null,
        enseignant: null,
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Filter matieres by semestre and classe
  const filteredMatieres = matieres.filter((matiere) => {
    return (
      (filters.semestre === "" || matiere.semestre === parseInt(filters.semestre)) &&
      (filters.classe === "" || matiere.classe?.id === parseInt(filters.classe))
    );
  });

  // Submit form (create or update a matiere)
  const handleSubmit = async () => {
    try {
      const url = editMode
        ? `http://localhost:8000/api/matieres/update/${formData.id}/`
        : "http://localhost:8000/api/matieres/create/";
      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.nom,
          coefficient: parseFloat(formData.coefficient),
          semestre: parseInt(formData.semestre),
          classe_id: formData.classe,
          enseignant_id: formData.enseignant,
        }),
      });

      if (response.ok) {
        fetchMatieres();
        setSnackbar({
          open: true,
          message: editMode
            ? "Matière mise à jour avec succès"
            : "Matière créée avec succès",
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

  // Delete a matiere
  const handleDelete = async (id) => {
    if (!id) {
      console.error("Erreur : ID de matière non défini");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/matieres/delete/${id}/`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (data.success) {
        setMatieres(matieres.filter((matiere) => matiere.id !== id));
        setSnackbar({
          open: true,
          message: "Matière supprimée avec succès",
          severity: "success",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression",
        severity: "error",
      });
    }
  };

  // Close Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Gestion des Matières
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<GetAppIcon />}
            onClick={downloadTemplate}
            sx={{ mr: 2 }}
          >
            Télécharger le Modèle
          </Button>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mr: 2 }}
          >
            Importer CSV
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileUpload}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nouvelle Matière
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filtres
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="semestre-label">Semestre</InputLabel>
              <Select
                labelId="semestre-label"
                name="semestre"
                value={filters.semestre}
                onChange={handleFilterChange}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value={1}>Semestre 1</MenuItem>
                <MenuItem value={2}>Semestre 2</MenuItem>
                <MenuItem value={3}>Semestre 3</MenuItem>
                <MenuItem value={4}>Semestre 4</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="classe-label">Classe</InputLabel>
              <Select
                labelId="classe-label"
                name="classe"
                value={filters.classe}
                onChange={handleFilterChange}
              >
                <MenuItem value="">Toutes</MenuItem>
                {classes.map((classe) => (
                  <MenuItem key={classe.id} value={classe.id}>
                    {classe.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Table of matieres */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nom de la Matière</TableCell>
              <TableCell align="center">Coefficient</TableCell>
              <TableCell align="center">Semestre</TableCell>
              <TableCell align="center">Classe</TableCell>
              <TableCell align="center">Enseignant</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMatieres.length > 0 ? (
              filteredMatieres.map((matiere) => (
                <TableRow key={matiere.id}>
                  <TableCell>{matiere.nom}</TableCell>
                  <TableCell align="center">{matiere.coefficient}</TableCell>
                  <TableCell align="center">{matiere.semestre}</TableCell>
                  <TableCell align="center">
                    {matiere.classe?.nom || "Inconnu"}
                  </TableCell>
                  <TableCell align="center">
                    {matiere.enseignant
                      ? `${matiere.enseignant.first_name} ${matiere.enseignant.last_name}`
                      : "Inconnu"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(matiere)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(matiere.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucune matière disponible
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for adding/editing a matiere */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Modifier la Matière" : "Créer une Nouvelle Matière"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nom"
                label="Nom de la Matière"
                fullWidth
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="coefficient"
                label="Coefficient"
                fullWidth
                type="number"
                value={formData.coefficient}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="semestre-label">Semestre</InputLabel>
                <Select
                  labelId="semestre-label"
                  name="semestre"
                  value={formData.semestre}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value={1}>Semestre 1</MenuItem>
                  <MenuItem value={2}>Semestre 2</MenuItem>
                  <MenuItem value={3}>Semestre 3</MenuItem>
                  <MenuItem value={4}>Semestre 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="classe-label">Classe</InputLabel>
                <Select
                  labelId="classe-label"
                  name="classe"
                  value={formData.classe || ""}
                  onChange={handleInputChange}
                  required
                >
                  {classes.map((classe) => (
                    <MenuItem key={classe.id} value={classe.id}>
                      {classe.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="enseignant-label">Enseignant</InputLabel>
                <Select
                  labelId="enseignant-label"
                  name="enseignant"
                  value={formData.enseignant || ""}
                  onChange={handleInputChange}
                  required
                >
                  {enseignants.map((enseignant) => (
                    <MenuItem key={enseignant.id} value={enseignant.id}>
                      {enseignant.first_name} {enseignant.last_name}
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

      {/* Snackbar for notifications */}
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

export default AdminMatieres;