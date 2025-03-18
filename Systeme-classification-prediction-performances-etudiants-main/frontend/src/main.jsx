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
import AdminPerformance from "./pages/admin/Performances ";
import AdminAnalyse from "./pages/admin/Analyse";

// Dashboard Pages - Teacher
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherNotes from "./pages/teacher/Notes ";
import TeacherAnalyse from "./pages/teacher/Analyse";
import TeacherAlertes from "./pages/teacher/Alertes ";

// Dashboard Pages - Student
import StudentDashboard from "./pages/student/Dashboard";
import StudentGuidance from "./pages/student/Guidance ";
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
      { path: "Performances", element: <AdminPerformance  /> },
      { path: "Analyse", element: <AdminAnalyse  /> },
      { path: "Etudiants", element: <Etudiants/> },
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
      { path: "Analyse", element: <TeacherAnalyse /> },
      { path: "Alertes", element: <TeacherAlertes /> },
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
      { path: "Guidance", element: <StudentGuidance /> },
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