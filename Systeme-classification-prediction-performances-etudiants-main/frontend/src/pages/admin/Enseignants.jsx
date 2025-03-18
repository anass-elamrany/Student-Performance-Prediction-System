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
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";

const AdminEnseignants = () => {
  const [enseignants, setEnseignants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch enseignants from the backend
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

  // Load data on component mount
  useEffect(() => {
    fetchEnseignants();
  }, []);

  // Open dialog for adding/editing an enseignant
  const handleOpenDialog = (enseignant = null) => {
    if (enseignant) {
      setFormData({
        id: enseignant.id,
        first_name: enseignant.first_name,
        last_name: enseignant.last_name,
        email: enseignant.email,
        phone: enseignant.phone,
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
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

  // Submit form (create or update enseignant)
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
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
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

  // Delete an enseignant
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

      {/* Statistics Cards */}
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
                <PersonIcon color="primary" />
              </Box>
              <Typography variant="h4" component="div" sx={{ mt: 2 }}>
                {enseignants.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table of enseignants */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell align="center">Prénom</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">Téléphone</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enseignants.map((enseignant) => (
              <TableRow key={enseignant.id}>
                <TableCell>{enseignant.last_name}</TableCell>
                <TableCell align="center">{enseignant.first_name}</TableCell>
                <TableCell align="center">{enseignant.email}</TableCell>
                <TableCell align="center">{enseignant.phone}</TableCell>
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

      {/* Dialog for adding/editing enseignant */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Modifier l'Enseignant" : "Ajouter un Enseignant"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="last_name"
                label="Nom"
                fullWidth
                value={formData.last_name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="first_name"
                label="Prénom"
                fullWidth
                value={formData.first_name}
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
                name="phone"
                label="Téléphone"
                fullWidth
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
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

export default AdminEnseignants;