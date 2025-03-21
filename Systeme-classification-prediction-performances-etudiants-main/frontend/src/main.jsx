import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import AdminAnalyse from "./pages/admin/Analyse";
import AdminMatieres from "./pages/admin/Matieres";
import AdminPredict from "./pages/admin/AdminPredict";
import AdminClassment from "./pages/admin/AdminClassment";
import AdminAlerts from "./pages/admin/AdminAlerts";

// Dashboard Pages - Teacher
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherNotes from "./pages/teacher/Notes ";
import TeacherAnalysis from "./pages/teacher/Analyse";
import Profile from "./pages/teacher/Profile";

// Dashboard Pages - Student
import StudentDashboard from "./pages/student/Dashboard";
import StudentRecommendations from "./pages/student/Recommendations";
import StudentAlerts from "./pages/student/MesAlerts";
import StudentNotes from "./pages/student/Mes Notes ";




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
      { path: "Analyse", element: <AdminAnalyse  /> },
      { path: "Etudiants", element: <Etudiants/> },
      { path: "Matieres", element: <AdminMatieres/> },
      { path: "Predict", element: <AdminPredict/> },
      { path: "Classment", element: <AdminClassment/> },
      { path: "Alerts", element: <AdminAlerts/> },
      { path: "Recommendations", element: <AdminRecommendations/> },
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
      { path: "Alerts", element: <StudentAlerts /> }, 
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);