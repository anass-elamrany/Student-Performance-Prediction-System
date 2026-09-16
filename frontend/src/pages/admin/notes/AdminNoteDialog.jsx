import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";

const fields = [
  ["note_module", "Module Grade"],
  ["note_devoir_projet", "Assignment/Project Grade"],
  ["assiduite", "Attendance"],
  ["presence", "Presence"],
];

const AdminNoteDialog = ({
  editMode,
  formData,
  onChange,
  onClose,
  onSubmit,
  open,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      {editMode ? "Edit Grade" : "Add Grade"}
    </DialogTitle>
    <DialogContent>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {fields.map(([name, label]) => (
          <Grid item xs={12} sm={6} key={name}>
            <TextField
              name={name}
              label={label}
              fullWidth
              type="number"
              value={formData[name]}
              onChange={onChange}
              required
            />
          </Grid>
        ))}
      </Grid>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSubmit} variant="contained">
        {editMode ? "Update" : "Add"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default AdminNoteDialog;
