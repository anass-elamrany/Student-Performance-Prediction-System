import {
  Card,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const getPresenceColor = (theme, presence) => {
  if (presence >= 90) return theme.palette.success.main;
  if (presence >= 75) return theme.palette.primary.main;
  if (presence >= 50) return theme.palette.warning.main;
  return theme.palette.error.main;
};

const ScoreChip = ({ label, color }) => (
  <Chip
    label={label}
    sx={{
      fontWeight: "bold",
      color: "white",
      backgroundColor: color,
    }}
  />
);

const TeacherNotesTable = ({
  getScoreColor,
  notes,
  onDelete,
  onEdit,
  selectedMatiere,
  students,
}) => {
  const theme = useTheme();

  return (
    <Card elevation={2} sx={{ overflow: "hidden", bgcolor: theme.palette.background.paper }}>
      <TableContainer component={Paper} elevation={0} sx={{ bgcolor: theme.palette.background.paper }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
              {["Student", "Module Grade", "Assignment/Project Grade", "Attendance", "Presence", "Actions"].map((header) => (
                <TableCell
                  key={header}
                  align={header === "Student" ? "left" : "center"}
                  sx={{ fontWeight: "bold", color: "text.primary", fontSize: "1rem" }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length > 0 ? (
              students.map((student) => {
                const note = notes.find((item) => item.etudiant.id === student.id);
                return (
                  <TableRow
                    key={student.id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: theme.palette.action.hover,
                      },
                      '&:hover': {
                        backgroundColor: theme.palette.action.selected,
                      },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="medium">
                        {`${student.first_name} ${student.last_name}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {note ? <ScoreChip label={note.note_module} color={getScoreColor(note.note_module)} /> : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {note ? <ScoreChip label={note.note_devoir_projet} color={getScoreColor(note.note_devoir_projet)} /> : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {note ? <ScoreChip label={note.assiduite} color={getScoreColor(note.assiduite)} /> : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {note && note.presence !== undefined && note.presence !== null ? (
                        <ScoreChip label={`${note.presence}%`} color={getPresenceColor(theme, note.presence)} />
                      ) : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        aria-label="Edit"
                        onClick={() => onEdit(note || { etudiant: student, matiere: { id: selectedMatiere } })}
                        sx={{
                          color: theme.palette.primary.main,
                          "&:hover": {
                            backgroundColor: "rgba(76, 175, 80, 0.04)",
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      {note && (
                        <IconButton
                          color="error"
                          aria-label="Delete"
                          onClick={() => onDelete(note.id)}
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(244, 67, 54, 0.04)",
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {selectedMatiere
                      ? "No students found for this subject."
                      : "Select a subject to display students."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default TeacherNotesTable;
