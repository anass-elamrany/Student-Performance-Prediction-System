import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from "@mui/material";
import { fetchWithTokenRefresh } from "../../utils/auth";

const StudentNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetchWithTokenRefresh("http://localhost:8000/api/student/notes/");
      const data = await response.json();

      console.log("API Response:", data); // Debugging: Log the API response

      if (data.success && Array.isArray(data.notes)) {
        // Debugging: Log the filtered notes
        const filteredNotes = data.notes.filter(note => note.date_ajout);
        console.log("Filtered Notes:", filteredNotes);

        setNotes(filteredNotes);
      } else {
        console.error("Invalid API response format:", data);
        setNotes([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mes Notes
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Consultez vos notes par matière
      </Typography>

      {/* Notes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Matière</TableCell>
              <TableCell align="right">Note Module</TableCell>
              <TableCell align="right">Note Devoir/Projet</TableCell>
              <TableCell align="right">Assiduité</TableCell>
              <TableCell align="right">Présence</TableCell>
              <TableCell align="right">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.length > 0 ? (
              notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>
                    {typeof note.matiere === 'object' ? note.matiere.nom : `Matière ID: ${note.matiere}`}
                  </TableCell>
                  <TableCell align="right">{note.note_module}</TableCell>
                  <TableCell align="right">{note.note_devoir_projet}</TableCell>
                  <TableCell align="right">{note.assiduite}</TableCell>
                  <TableCell align="right">{note.presence}</TableCell>
                  <TableCell align="right">
                    {note.date_ajout ? new Date(note.date_ajout).toLocaleDateString() : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucune note disponible.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentNotes;