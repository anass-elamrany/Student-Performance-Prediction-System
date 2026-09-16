import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  useTheme,
} from "@mui/material";

const fields = [
  ["note_module", "Module Grade"],
  ["note_devoir_projet", "Assignment/Project Grade"],
  ["assiduite", "Attendance"],
  ["presence", "Presence"],
];

const TeacherNoteDialog = ({
  editMode,
  formData,
  onChange,
  onClose,
  onSubmit,
  open,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle sx={{
        borderBottom: 1,
        borderColor: 'divider',
        fontWeight: 'bold',
        color: 'primary.main',
      }}>
        {editMode ? "Edit Grade" : "Add Grade"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {fields.map(([name, label]) => (
            <Grid item xs={12} sm={6} key={name}>
              <TextField
                name={name}
                label={label}
                fullWidth
                value={formData[name]}
                onChange={onChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          sx={{
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
              backgroundColor: 'primary.dark',
            },
          }}
        >
          {editMode ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherNoteDialog;
