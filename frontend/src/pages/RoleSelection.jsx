import { Link } from "react-router-dom"
import { Box, Typography, Button, Container, Paper, Grid, useTheme } from "@mui/material"
import SchoolIcon from "@mui/icons-material/School"
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount"
import PersonIcon from "@mui/icons-material/Person"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const SelectionRole = () => {
  const theme = useTheme();

  const roles = [
    {
      id: "admin",
      title: "Administrateur",
      description: "Gestion globale et paramétrage du système",
      icon: <SupervisorAccountIcon sx={{ fontSize: 60 }} />,
      color: theme.palette.primary.main,
      borderColor: theme.palette.secondary.main
    },
    {
      id: "teacher",
      title: "Enseignant",
      description: "Suivi des performances et détection des risques",
      icon: <SchoolIcon sx={{ fontSize: 60 }} />,
      color: theme.palette.secondary.main,
      borderColor: theme.palette.primary.main
    },
    {
      id: "student",
      title: "Étudiant",
      description: "Consultation des résultats et orientation",
      icon: <PersonIcon sx={{ fontSize: 60 }} />,
      color: theme.palette.primary.main,
      borderColor: theme.palette.secondary.main
    },
  ]

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: 'background.default' }}>
    <Navbar />
    <Container
      maxWidth="lg"
      sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", py: 8 }}
    >
      
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
            Bienvenue sur <Box component="span" sx={{ color: 'secondary.main' }}>EduPredict</Box>
          </Typography>
          <Typography variant="h5" color="textSecondary" sx={{ maxWidth: 600, mx: "auto", mb: 2 }}>
            Veuillez sélectionner votre espace de connexion
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {roles.map((role) => (
            <Grid item xs={12} md={4} key={role.id}>
              <Link to={`/login/${role.id}`} style={{ textDecoration: "none" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: "all 0.3s ease-in-out",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                      borderColor: role.color,
                      '& .role-icon': {
                        transform: 'scale(1.1)',
                        color: role.color
                      }
                    },
                  }}
                >
                  <Box
                    className="role-icon"
                    sx={{
                      p: 3,
                      borderRadius: "50%",
                      bgcolor: `${role.color}15`, // VERY subtle tint
                      color: role.color,
                      mb: 3,
                      transition: "transform 0.3s ease",
                    }}
                  >
                    {role.icon}
                  </Box>
                  <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {role.title}
                  </Typography>
                  <Typography variant="body1" align="center" color="text.secondary">
                    {role.description}
                  </Typography>
                </Paper>
              </Link>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Button component={Link} to="/" sx={{ fontSize: "1rem", fontWeight: 600, color: 'text.secondary' }}>
            ← Retour à l'accueil
          </Button>
        </Box>
     
    </Container>
    <Footer />
  </Box>
  )
}

export default SelectionRole

