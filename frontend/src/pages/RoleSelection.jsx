import { Link } from "react-router-dom"
import { Box, Typography, Button, Container, Paper, Grid } from "@mui/material"
import SchoolIcon from "@mui/icons-material/School"
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount"
import PersonIcon from "@mui/icons-material/Person"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const SelectionRole = () => {
  const roles = [
    {
      id: "admin",
      title: "Administrateur",
      description: "Gérer l'école, les enseignants et les élèves",
      icon: <SupervisorAccountIcon sx={{ fontSize: 80 }} />,
      color: "#3f51b5",
    },
    {
      id: "teacher",
      title: "Enseignant",
      description: "Gérer les classes, les devoirs et les notes",
      icon: <SchoolIcon sx={{ fontSize: 80 }} />,
      color: "#4caf50",
    },
    {
      id: "student",
      title: "Étudiant",
      description: "Consulter les cours, les devoirs et les notes",
      icon: <PersonIcon sx={{ fontSize: 80 }} />,
      color: "#ff9800",
    },
  ]

  return (
    <>
    <Navbar />
    <Container
      maxWidth="lg"
      sx={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}
    >
      
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          Sélectionnez Votre Rôle
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 5 }}>
          Choisissez votre rôle pour continuer vers la page de connexion
        </Typography>

        <Grid container spacing={6} justifyContent="center">
          {roles.map((role) => (
            <Grid item xs={12} sm={4} key={role.id}>
              <Link to={`/login/${role.id}`} style={{ textDecoration: "none" }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "50%",
                      bgcolor: `${role.color}20`,
                      color: role.color,
                      mb: 3,
                    }}
                  >
                    {role.icon}
                  </Box>
                  <Typography variant="h5" component="h2" align="center" gutterBottom fontWeight="500">
                    {role.title}
                  </Typography>
                  <Typography variant="body1" align="center" color="textSecondary">
                    {role.description}
                  </Typography>
                </Paper>
              </Link>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ m: 6, textAlign: "center" }}>
          <Button component={Link} to="/" variant="text" sx={{ mt: 5, fontSize: "1.1rem", p: 1.5 }} color="primary">
            Retour à l'Accueil
          </Button>
        </Box>
     
    </Container>
    <Footer />
  </>
  )
}

export default SelectionRole

