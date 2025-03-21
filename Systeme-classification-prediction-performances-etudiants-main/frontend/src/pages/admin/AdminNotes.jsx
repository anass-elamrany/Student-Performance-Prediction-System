import React, { useState, useEffect, useCallback } from "react";
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
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import { refreshToken, checkAuthStatus, getUserRole } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

const AdminNotes = () => {
  const [notes, setNotes] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    matiere_id: "",
    etudiant_id: "",
    note_module: "",
    note_devoir_projet: "",
    assiduite: "",
    presence: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch Matieres and Notes
  useEffect(() => {
    setLoading(true);
    fetchMatieres().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedMatiere) {
      setLoading(true);
      fetchStudents()
        .then(() => fetchNotes())
        .finally(() => setLoading(false));
    }
  }, [selectedMatiere]);

  const fetchWithTokenRefresh = async (url, options = {}) => {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (response.status === 401) {
      const newAccessToken = await refreshToken();
      if (newAccessToken) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      } else {
        throw new Error("Failed to refresh token");
      }
    }

    return response;
  };

  const fetchMatieres = async () => {
    try {
      const response = await fetchWithTokenRefresh("http://localhost:8000/api/admin/matieres/");
      const data = await response.json();
      if (data.success) {
        setMatieres(data.matieres);
      }
    } catch (error) {
      console.error("Error fetching matieres:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération des matières",
        severity: "error",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetchWithTokenRefresh(
        `http://localhost:8000/api/admin/students-by-matiere/?matiere_id=${selectedMatiere}`
      );
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération des étudiants",
        severity: "error",
      });
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetchWithTokenRefresh(
        `http://localhost:8000/api/admin/notes/?matiere_id=${selectedMatiere}`
      );
      const data = await response.json();
      if (data.success) {
        const notesWithStudents = data.notes.map((note) => {
          const student = students.find((s) => s.id === note.etudiant);
          return {
            ...note,
            etudiant: student || { id: note.etudiant },
          };
        });
        setNotes(notesWithStudents);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération des notes",
        severity: "error",
      });
    }
  };

  // Handle CSV file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setSnackbar({
        open: true,
        message: "Veuillez sélectionner un fichier CSV",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetchWithTokenRefresh("http://localhost:8000/api/admin/notes/import/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        fetchNotes();
        setSnackbar({
          open: true,
          message: data.message || "Notes importées avec succès",
          severity: "success",
        });
      } else {
        throw new Error(data.message || "Erreur lors de l'importation du fichier CSV");
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
    if (!selectedMatiere) {
      setSnackbar({
        open: true,
        message: "Veuillez sélectionner une matière avant de télécharger le modèle",
        severity: "warning",
      });
      return;
    }

    const headers = [
      "matiere_id",
      "etudiant_id",
      "etudiant_nom",
      "note_module",
      "note_devoir_projet",
      "assiduite",
      "presence",
    ];
    const csvContent = [
      headers.join(","),
      ...students.map((student) => {
        return [
          selectedMatiere,
          student.id,
          `${student.first_name} ${student.last_name}`,
          "", "", "", "",
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `template_notes_${selectedMatiere}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Open dialog for editing a note
  const handleOpenDialog = (note = null) => {
    if (note) {
      setFormData({
        id: note.id,
        matiere_id: note.matiere?.id || selectedMatiere,
        etudiant_id: note.etudiant?.id || "",
        note_module: note.note_module || "",
        note_devoir_projet: note.note_devoir_projet || "",
        assiduite: note.assiduite || "",
        presence: note.presence || "",
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        matiere_id: selectedMatiere,
        etudiant_id: "",
        note_module: "",
        note_devoir_projet: "",
        assiduite: "",
        presence: "",
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

  // Submit form (create or update note)
  const handleSubmit = async () => {
    try {
      const url = "http://localhost:8000/api/admin/notes/create-update/";
      const method = "POST";

      const response = await fetchWithTokenRefresh(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        fetchNotes();
        setSnackbar({
          open: true,
          message: data.message || "Note créée/mise à jour avec succès",
          severity: "success",
        });
        handleCloseDialog();
      } else {
        throw new Error(data.message || "Erreur lors de la requête");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  // Delete a note
  const handleDelete = async (id) => {
    try {
      const response = await fetchWithTokenRefresh(`http://localhost:8000/api/admin/notes/delete/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchNotes();
        setSnackbar({
          open: true,
          message: "Note supprimée avec succès",
          severity: "info",
        });
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  // Handle Matiere filter change
  const handleMatiereFilterChange = (e) => {
    setSelectedMatiere(e.target.value);
  };

  // Redirect if user is not an admin
  useEffect(() => {
    const userRole = getUserRole();
    if (userRole !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

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
          Gestion des Notes (Admin)
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
        </Box>
      </Box>

      {/* Matiere Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="matiere-filter-label">Filtrer par Matière</InputLabel>
          <Select
            labelId="matiere-filter-label"
            value={selectedMatiere}
            onChange={handleMatiereFilterChange}
            label="Filtrer par Matière"
          >
            <MenuItem value="">Toutes les Matières</MenuItem>
            {matieres.map((matiere) => (
              <MenuItem key={matiere.id} value={matiere.id}>
                {matiere.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Table of Students and Notes */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Étudiant</TableCell>
              <TableCell align="center">Note Module</TableCell>
              <TableCell align="center">Note Devoir/Projet</TableCell>
              <TableCell align="center">Assiduité</TableCell>
              <TableCell align="center">Présence</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => {
              const note = notes.find((n) => n.etudiant.id === student.id);
              return (
                <TableRow key={student.id}>
                  <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                  <TableCell align="center">
                    {note ? note.note_module : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {note ? note.note_devoir_projet : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {note ? note.assiduite : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {note ? note.presence : "-"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      aria-label="Edit"
                      onClick={() => handleOpenDialog(note || { etudiant: student, matiere: { id: selectedMatiere } })}
                    >
                      <EditIcon />
                    </IconButton>
                    {note && (
                      <IconButton
                        color="error"
                        aria-label="Delete"
                        onClick={() => handleDelete(note.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for adding/editing a note */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Modifier la Note" : "Ajouter une Note"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="note_module"
                label="Note Module"
                fullWidth
                value={formData.note_module}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="note_devoir_projet"
                label="Note Devoir/Projet"
                fullWidth
                value={formData.note_devoir_projet}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="assiduite"
                label="Assiduité"
                fullWidth
                value={formData.assiduite}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="presence"
                label="Présence"
                fullWidth
                value={formData.presence}
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default AdminNotes;