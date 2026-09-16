import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Snackbar,
  Typography,
  useTheme,
} from "@mui/material";

import TeacherNoteDialog from "./notes/TeacherNoteDialog";
import TeacherNotesTable from "./notes/TeacherNotesTable";
import TeacherNotesToolbar from "./notes/TeacherNotesToolbar";
import { useTeacherNotes } from "./notes/useTeacherNotes";

const TeacherNotes = () => {
  const theme = useTheme();
  const {
    closeSnackbar,
    downloadTemplate,
    editMode,
    formData,
    handleCloseDialog,
    handleDelete,
    handleFileUpload,
    handleInputChange,
    handleMatiereFilterChange,
    handleOpenDialog,
    handleSubmit,
    loading,
    matieres,
    notes,
    openDialog,
    selectedMatiere,
    snackbar,
    students,
  } = useTeacherNotes();

  const getScoreColor = (score) => {
    if (!score && score !== 0) return theme.palette.text.secondary;
    if (score >= 16) return theme.palette.success.main;
    if (score >= 12) return theme.palette.primary.main;
    if (score >= 8) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            Grade Management
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Assign and manage student grades
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      <TeacherNotesToolbar
        matieres={matieres}
        onDownloadTemplate={downloadTemplate}
        onFileUpload={handleFileUpload}
        onMatiereChange={handleMatiereFilterChange}
        selectedMatiere={selectedMatiere}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TeacherNotesTable
          getScoreColor={getScoreColor}
          notes={notes}
          onDelete={handleDelete}
          onEdit={handleOpenDialog}
          selectedMatiere={selectedMatiere}
          students={students}
        />
      )}

      <TeacherNoteDialog
        editMode={editMode}
        formData={formData}
        onChange={handleInputChange}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        open={openDialog}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherNotes;
