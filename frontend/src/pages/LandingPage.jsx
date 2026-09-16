import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowForward,
  Person,
  School,
  SupervisorAccount,
} from "@mui/icons-material";
import PageTitle from "../components/PageTitle";
import backgroundImage from "../assets/images/background_Loginpage.png";

const roles = [
  {
    id: "admin",
    title: "Administrator",
    description: "Manage students, teachers, classes and academic data.",
    icon: <SupervisorAccount fontSize="large" />,
    button: "Access Admin Portal",
  },
  {
    id: "teacher",
    title: "Teacher",
    description: "Monitor classes, manage grades, attendance and student performance.",
    icon: <School fontSize="large" />,
    button: "Access Teacher Portal",
  },
  {
    id: "student",
    title: "Student",
    description: "View grades, progress, alerts and personalized academic guidance.",
    icon: <Person fontSize="large" />,
    button: "Access Student Portal",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <PageTitle
        title="Student Performance Prediction System"
        description="Academic monitoring, prediction and student performance analysis platform."
      />

      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: { xs: 5, md: 8 },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <School sx={{ fontSize: 40, mr: 1, color: "white" }} />
            <Typography
              variant="h4"
              component="span"
              sx={{
                fontWeight: 700,
                color: "white",
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              Academic Portal
            </Typography>
          </Link>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            width: "100%",
            border: "1px solid",
            borderColor: "divider",
            background: "rgba(255, 255, 255, 1)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          }}
        >
          <Stack spacing={4} alignItems="center">
            <Box sx={{ textAlign: "center", maxWidth: 780 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  mx: "auto",
                  mb: 2,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(5, 25, 45, 0.2)",
                }}
              >
                <School fontSize="large" />
              </Box>
              <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 700, mb: 1 }}>
                Student Performance Prediction System
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                Academic monitoring, prediction and student performance analysis platform.
              </Typography>
            </Box>

            <Grid container spacing={3} alignItems="stretch">
              {roles.map((role) => (
                <Grid item xs={12} md={4} key={role.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: "100%",
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      background: "rgba(255, 255, 255, 1)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        color: "white",
                        mb: 2,
                        boxShadow: "0 4px 12px rgba(5, 25, 45, 0.2)",
                      }}
                    >
                      {role.icon}
                    </Box>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                      {role.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, flexGrow: 1, mb: 3 }}
                    >
                      {role.description}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      size="large"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate(`/login/${role.id}`)}
                      sx={{
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "white",
                        boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)",
                      }}
                    >
                      {role.button}
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Alert
              severity="info"
              sx={{
                width: "100%",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              EST Oujda - Academic Year 2026/2027 - Accounts are provided by the administration.
            </Alert>
          </Stack>
        </Paper>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3, color: "white", fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}
        >
          PFE 2024/2025 - EST Oujda - Student Performance Prediction System
        </Typography>
      </Container>
    </Box>
  );
};

export default LandingPage;
