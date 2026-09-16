import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Snackbar,
  Typography,
} from "@mui/material";

import AdminNoteDialog from "./notes/AdminNoteDialog";
import AdminNotesControls from "./notes/AdminNotesControls";
import AdminNotesSummary from "./notes/AdminNotesSummary";
import AdminNotesTable from "./notes/AdminNotesTable";
import { useAdminNotes } from "./notes/useAdminNotes";

const AdminNotes = () => {
  const {
    closeSnackbar,
    downloadTemplate,
    editMode,
    formData,
    handleCloseDialog,
    handleDelete,
    handleFileUpload,
    handleInputChange,
    handleOpenDialog,
    handleSubmit,
    loading,
    matieres,
    notes,
    openDialog,
    selectedMatiere,
    setSelectedMatiere,
    snackbar,
    students,
  } = useAdminNotes();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Grade Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage student grades by subject
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      <AdminNotesSummary totalNotes={notes.length} />

      <AdminNotesControls
        matieres={matieres}
        onAdd={() => handleOpenDialog()}
        onDownloadTemplate={downloadTemplate}
        onFileUpload={handleFileUpload}
        onMatiereChange={setSelectedMatiere}
        selectedMatiere={selectedMatiere}
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <AdminNotesTable
        notes={notes}
        onDelete={handleDelete}
        onEdit={handleOpenDialog}
        selectedMatiere={selectedMatiere}
        students={students}
      />

      <AdminNoteDialog
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
      >
        <Alert
          onClose={closeSnackbar}
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
