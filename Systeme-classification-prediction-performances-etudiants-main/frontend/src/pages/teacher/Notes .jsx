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
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const TeacherNotes = () => {
  const [classes, setClasses] = useState([]);
  const [matiere, setMatiere] = useState(null);
  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [error, setError] = useState(null);

  // Fonction pour rafraîchir le token JWT
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await fetch("http://localhost:8000/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du rafraîchissement du token");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.access); // Mettre à jour le token d'accès
      return data.access;
    } catch (error) {
      console.error("Refresh token error:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("currentUser");
      window.location.href = "/login"; // Rediriger vers la page de connexion
      return null;
    }
  };

  // Fetch classes from the backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("http://localhost:8000/api/classes/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setError("Erreur lors de la récupération des classes. Veuillez réessayer.");
      }
    };

    fetchClasses();
  }, []);

  // Fetch students and matiere based on selected class
  useEffect(() => {
    if (selectedClass) {
      const fetchStudentsAndMatiere = async () => {
        try {
          const token = localStorage.getItem("accessToken");

          // Fetch students
          const studentsResponse = await fetch(
            `http://localhost:8000/api/get_classe_students/${selectedClass}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!studentsResponse.ok) {
            throw new Error(`Erreur HTTP: ${studentsResponse.status}`);
          }

          const studentsData = await studentsResponse.json();
          setStudents(studentsData);

          // Fetch matiere
          const matiereResponse = await fetch(
            `http://localhost:8000/api/get_enseignant_matiere_classe/${selectedClass}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!matiereResponse.ok) {
            throw new Error(`Erreur HTTP: ${matiereResponse.status}`);
          }

          const matiereData = await matiereResponse.json();
          setMatiere(matiereData);

          // Fetch notes for each student
          const notesData = [];
          for (const student of studentsData) {
            const notesResponse = await fetch(
              `http://localhost:8000/api/notes/${student.id}/${matiereData.id}/`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (notesResponse.ok) {
              const noteData = await notesResponse.json();
              if (noteData.length > 0) {
                notesData.push({
                  ...noteData[0],
                  etudiant_id: student.id, // Ajouter l'ID de l'étudiant pour faciliter la recherche
                  studentName: `${student.first_name} ${student.last_name}`,
                  id: noteData[0].id,
                });
              }
            }
          }
          setNotes(notesData);
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Erreur lors de la récupération des données. Veuillez réessayer.");
        }
      };

      fetchStudentsAndMatiere();
    }
  }, [selectedClass]);

  // Handle class selection change
  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  // Open dialog for editing a note
  const handleOpenDialog = (note) => {
    setCurrentNote(note);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentNote({
      ...currentNote,
      [name]: value,
    });
  };

  // Submit form (update or create note)
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8000/api/notes/update/${currentNote.etudiant_id}/${matiere.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            note_module: currentNote.note_module,
            note_devoir_projet: currentNote.note_devoir_projet,
            assiduite: currentNote.assiduite,
            presence: currentNote.presence,
          }),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Note mise à jour avec succès",
          severity: "success",
        });
        handleCloseDialog();
      } else {
        throw new Error("Erreur lors de la mise à jour de la note");
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
          Gestion des Notes
        </Typography>
      </Box>

      {/* Afficher les erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Afficher la matière enseignée */}
      {matiere && (
        <Typography variant="h6" sx={{ mb: 3 }}>
          Matière enseignée : {matiere.nom}
        </Typography>
      )}

      {/* Filtre pour sélectionner la classe */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Classe</InputLabel>
            <Select value={selectedClass} onChange={handleClassChange} label="Classe">
              {classes.map((classe) => (
                <MenuItem key={classe.id} value={classe.id}>
                  {classe.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Table des étudiants */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Étudiant</TableCell>
              <TableCell align="center">Nom</TableCell>
              <TableCell align="center">Prénom</TableCell>
              <TableCell align="center">Note Module</TableCell>
              <TableCell align="center">Note Devoir/Projet</TableCell>
              <TableCell align="center">Assiduité</TableCell>
              <TableCell align="center">Présence</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => {
              // Trouver les notes de l'étudiant
              const studentNote = notes.find((note) => note.etudiant_id === student.id);

              return (
                <TableRow key={student.id}>
                  <TableCell>{student.username}</TableCell>
                  <TableCell align="center">{student.first_name}</TableCell>
                  <TableCell align="center">{student.last_name}</TableCell>
                  <TableCell align="center">
                    {studentNote ? studentNote.note_module : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {studentNote ? studentNote.note_devoir_projet : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {studentNote ? studentNote.assiduite : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {studentNote ? studentNote.presence : "-"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() =>
                        handleOpenDialog({
                          etudiant_id: student.id,
                          studentName: `${student.first_name} ${student.last_name}`,
                          note_module: studentNote ? studentNote.note_module : 0,
                          note_devoir_projet: studentNote ? studentNote.note_devoir_projet : 0,
                          assiduite: studentNote ? studentNote.assiduite : 0,
                          presence: studentNote ? studentNote.presence : 0,
                        })
                      }
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog pour modifier ou ajouter une note */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Modifier la Note</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="note_module"
                label="Note Module"
                fullWidth
                value={currentNote?.note_module || ""}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="note_devoir_projet"
                label="Note Devoir/Projet"
                fullWidth
                value={currentNote?.note_devoir_projet || ""}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="assiduite"
                label="Assiduité"
                fullWidth
                value={currentNote?.assiduite || ""}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="presence"
                label="Présence"
                fullWidth
                value={currentNote?.presence || ""}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<SaveIcon />}>
            Enregistrer
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

export default TeacherNotes;