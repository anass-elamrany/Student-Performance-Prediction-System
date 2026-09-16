import {
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const AdminNotesTable = ({
  notes,
  onDelete,
  onEdit,
  selectedMatiere,
  students,
}) => (
  <Card elevation={2}>
    <CardContent sx={{ p: 0 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Module Grade</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Assignment/Project Grade</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Attendance</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Presence</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedMatiere && students.length > 0 ? (
              students.map((student) => {
                const note = notes.find((item) => item.etudiant.id === student.id);
                return (
                  <TableRow
                    key={student.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                    <TableCell align="center">{note ? note.note_module : "-"}</TableCell>
                    <TableCell align="center">{note ? note.note_devoir_projet : "-"}</TableCell>
                    <TableCell align="center">{note ? note.assiduite : "-"}</TableCell>
                    <TableCell align="center">{note ? note.presence : "-"}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => onEdit(note || { etudiant: student, matiere: { id: selectedMatiere } })}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {note && (
                        <IconButton
                          color="error"
                          onClick={() => onDelete(note.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {selectedMatiere
                    ? "No students available for this subject"
                    : "Select a subject to display grades"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
);

export default AdminNotesTable;
