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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";

const AdminEtudiants = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nom: "",
    prénom: "",
    email: "",
    téléphone: "",
    numeroApogee: "",
    classes: [],
  });
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("Toutes");

  // Fetch students and classes from the backend
  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/students/");
      const data = await response.json();
      setEtudiants(data);
      setFilteredEtudiants(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/classes/");
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  // Handle filtering students by class
  useEffect(() => {
    if (selectedClass === "Toutes") {
      setFilteredEtudiants(etudiants);
    } else {
      const filtered = etudiants.filter(
        (etudiant) =>
          etudiant.classe && etudiant.classe.nom === selectedClass
      );
      setFilteredEtudiants(filtered);
    }
  }, [selectedClass, etudiants]);

  const handleOpenDialog = (etudiant = null) => {
    if (etudiant) {
      setFormData({
        id: etudiant.id,
        nom: etudiant.last_name,
        prénom: etudiant.first_name,
        email: etudiant.email,
        téléphone: etudiant.phone,
        numeroApogee: etudiant.n_appogie,
        classes: etudiant.classe ? [etudiant.classe.nom] : [],
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        nom: "",
        prénom: "",
        email: "",
        téléphone: "",
        numeroApogee: "",
        classes: [],
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
      [name]: name === "classes" ? [value] : value,
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editMode
        ? `http://localhost:8000/api/students/update/${formData.id}/`
        : "http://localhost:8000/api/students/create/";
      const method = editMode ? "PUT" : "POST";

      const body = JSON.stringify({
        last_name: formData.nom,
        first_name: formData.prénom,
        email: formData.email,
        phone: formData.téléphone,
        n_appogie: formData.numeroApogee,
        classes: formData.classes,
      });

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      const responseData = await response.json();
      if (response.ok) {
        fetchStudents();
        setSnackbar({
          open: true,
          message: editMode
            ? "Étudiant mis à jour avec succès"
            : "Étudiant ajouté avec succès",
          severity: "success",
        });
        handleCloseDialog();
      } else {
        throw new Error(responseData.error || "Erreur lors de la requête");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/students/delete/${id}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchStudents();
        setSnackbar({
          open: true,
          message: "Étudiant supprimé avec succès",
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

  const handleClassFilterChange = (e) => {
    setSelectedClass(e.target.value);
  };

  // Handle CSV file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/students/import/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        fetchStudents();
        setSnackbar({
          open: true,
          message: "Étudiants importés avec succès",
          severity: "success",
        });
      } else {
        throw new Error("Erreur lors de l'importation du fichier CSV");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  // Handle downloading the CSV template
  const downloadTemplate = () => {
    const headers = [
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Numéro Apogee",
      "Classe",
    ];
    const csvContent = headers.join(",") + "\n";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_etudiants.csv";
    link.click();
    URL.revokeObjectURL(url);
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
          Gestion des Étudiants
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
            Nouvel Étudiant
          </Button>
        </Box>
      </Box>

      {/* Sélecteur de classe pour filtrer les étudiants */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="filter-class-label">Filtrer par classe</InputLabel>
          <Select
            labelId="filter-class-label"
            value={selectedClass}
            onChange={handleClassFilterChange}
            label="Filtrer par classe"
          >
            <MenuItem value="Toutes">Toutes les classes</MenuItem>
            {classes.map((classe) => (
              <MenuItem key={classe.nom} value={classe.nom}>
                {classe.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nom et Prénom</TableCell>
              <TableCell align="center">N° Apogee</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">Téléphone</TableCell>
              <TableCell align="center">Classe</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEtudiants.map((etudiant) => (
              <TableRow key={etudiant.id}>
                <TableCell>{etudiant.first_name} {etudiant.last_name}</TableCell>
                <TableCell align="center">{etudiant.n_appogie}</TableCell>
                <TableCell align="center">{etudiant.email}</TableCell>
                <TableCell align="center">{etudiant.phone}</TableCell>
                <TableCell align="center">
                  {etudiant.classe ? (
                    <Chip label={etudiant.classe.nom} size="small" color="secondary" variant="outlined" />
                  ) : (
                    "Aucune classe"
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenDialog(etudiant)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(etudiant.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue pour Ajouter/Modifier un étudiant */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Modifier l'Étudiant" : "Ajouter un Étudiant"}
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
                name="numeroApogee"
                label="Numéro Apogee"
                fullWidth
                value={formData.numeroApogee}
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
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="classes-label">Classe</InputLabel>
                <Select
                  labelId="classes-label"
                  name="classes"
                  value={formData.classes[0] || ""}
                  onChange={handleInputChange}
                >
                  {classes.map((classe) => (
                    <MenuItem key={classe.nom} value={classe.nom}>
                      {classe.nom}
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
            {editMode ? "Mettre à jour" : "Ajouter"}
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

export default AdminEtudiants;