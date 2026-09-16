import { Box, Button, Grid, MenuItem, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";

const AdminNotesControls = ({
  matieres,
  onAdd,
  onDownloadTemplate,
  onFileUpload,
  onMatiereChange,
  selectedMatiere,
}) => (
  <>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
      <Button
        variant="contained"
        startIcon={<GetAppIcon />}
        onClick={onDownloadTemplate}
        sx={{ mr: 2 }}
        disabled={!selectedMatiere}
      >
        Download Template
      </Button>
      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUploadIcon />}
        sx={{ mr: 2 }}
        disabled={!selectedMatiere}
      >
        Import CSV
        <input type="file" hidden accept=".csv" onChange={onFileUpload} />
      </Button>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAdd}
        disabled={!selectedMatiere}
      >
        New Grade
      </Button>
    </Box>

    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Filter by subject
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Subject"
            name="matiere"
            value={selectedMatiere}
            onChange={(event) => onMatiereChange(event.target.value)}
          >
            <MenuItem value="">Select a Subject</MenuItem>
            {matieres.map((matiere) => (
              <MenuItem key={matiere.id} value={matiere.id}>
                {matiere.nom}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  </>
);

export default AdminNotesControls;
