import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { getDesignTokens } from './theme';

import LandingPage from "./pages/LandingPage";
import RoleSelection from "./pages/RoleSelection";
import LoginForm from "./pages/LoginForm";
import DashboardLayout from "./DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Dashboard Pages - Admin
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminClasses from "./pages/admin/Classes ";
import AdminEnseignants from "./pages/admin/Enseignants.jsx";
import Etudiants from "./pages/admin/Etudiants";
import AdminRecommendations from "./pages/admin/AdminRecommendations";
import AdminMatieres from "./pages/admin/Matieres";
import AdminClassment from "./pages/admin/AdminClassment";
import AdminAlerts from "./pages/admin/AdminAlerts";
import AdminNotes from "./pages/admin/AdminNotes";
// Dashboard Pages - Teacher
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherNotes from "./pages/teacher/Notes ";
import TeacherAnalysis from "./pages/teacher/Analyse";
import Profile from "./pages/teacher/Profile";
import PredictNotes from "./pages/admin/PredictNotes";
// Dashboard Pages - Student
import StudentDashboard from "./pages/student/Dashboard";
import StudentRecommendations from "./pages/student/Recommendations";
import StudentNotes from "./pages/student/Mes Notes ";
import StudentProfile from "./pages/student/StudentProfile";

const theme = createTheme(getDesignTokens("light", null));

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <RoleSelection /> },
  { path: "/login/:role", element: <LoginForm /> },

  // Admin Dashboard Routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout role="admin" />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "Classes", element: <AdminClasses /> },
      { path: "Enseignants", element: <AdminEnseignants /> },
      { path: "Etudiants", element: <Etudiants/> },
      { path: "Matieres", element: <AdminMatieres/> },
      { path: "Classment", element: <AdminClassment/> },
      { path: "Alerts", element: <AdminAlerts/> },
      { path: "Recommendations", element: <AdminRecommendations/> },
      { path: "AdminNotes", element: <AdminNotes/> },
      { path: "PredictNotes", element: <PredictNotes/> },
    ],
  },

  // Teacher Dashboard Routes
  {
    path: "/teacher",
    element: (
      <ProtectedRoute requiredRole="teacher">
        <DashboardLayout role="teacher" />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <TeacherDashboard /> },
      { path: "Notes", element: <TeacherNotes /> },
      { path: "Analyse", element: <TeacherAnalysis /> },
      { path: "Profile", element: <Profile /> },
    ],
  },

  // Student Dashboard Routes
  {
    path: "/student",
    element: (
      <ProtectedRoute requiredRole="student">
        <DashboardLayout role="student" />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "Guidance", element: <StudentRecommendations/> },
      { path: "Notes", element: <StudentNotes /> },
      { path: "StudentProfile", element: <StudentProfile /> }, 
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);