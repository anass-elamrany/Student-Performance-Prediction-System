import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";

const TeacherNotesToolbar = ({
  matieres,
  onDownloadTemplate,
  onFileUpload,
  onMatiereChange,
  selectedMatiere,
}) => (
  <Box sx={{
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    justifyContent: "space-between",
    alignItems: { xs: "flex-start", md: "center" },
    mb: 3,
    gap: 2,
  }}>
    <FormControl sx={{ minWidth: 240, bgcolor: "background.paper" }}>
      <InputLabel id="matiere-filter-label">Filter by Subject</InputLabel>
      <Select
        labelId="matiere-filter-label"
        value={selectedMatiere}
        onChange={onMatiereChange}
        label="Filter by Subject"
      >
        <MenuItem value="">All Subjects</MenuItem>
        {matieres.map((matiere) => (
          <MenuItem key={matiere.id} value={matiere.id}>
            {matiere.nom}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      <Button
        variant="contained"
        startIcon={<GetAppIcon />}
        onClick={onDownloadTemplate}
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
        }}
      >
        Download Template
      </Button>
      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUploadIcon />}
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
        }}
      >
        Import CSV
        <input type="file" hidden accept=".csv" onChange={onFileUpload} />
      </Button>
    </Box>
  </Box>
);

export default TeacherNotesToolbar;
