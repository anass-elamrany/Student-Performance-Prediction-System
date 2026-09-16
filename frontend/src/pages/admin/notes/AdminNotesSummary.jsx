import { Box, Card, CardContent, Grid, Typography, useTheme } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

const AdminNotesSummary = ({ totalNotes }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card
          elevation={2}
          sx={{
            height: 140,
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Grades
              </Typography>
              <SchoolIcon fontSize="medium" sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                {totalNotes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registered grades
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminNotesSummary;
