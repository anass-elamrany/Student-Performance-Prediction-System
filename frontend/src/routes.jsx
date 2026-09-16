import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const LoginForm = lazy(() => import("./pages/LoginForm"));
const DashboardLayout = lazy(() => import("./DashboardLayout"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminClasses = lazy(() => import("./pages/admin/Classes"));
const AdminTeachers = lazy(() => import("./pages/admin/Teachers"));
const AdminStudents = lazy(() => import("./pages/admin/Students"));
const AdminSubjects = lazy(() => import("./pages/admin/Subjects"));
const AdminRanking = lazy(() => import("./pages/admin/AdminRanking"));
const AdminAlerts = lazy(() => import("./pages/admin/AdminAlerts"));
const AdminRecommendations = lazy(() => import("./pages/admin/AdminRecommendations"));
const AdminNotes = lazy(() => import("./pages/admin/AdminNotes"));
const PredictNotes = lazy(() => import("./pages/admin/PredictNotes"));
const GlobalAIHub = lazy(() => import("./pages/admin/GlobalAIHub"));

const TeacherDashboard = lazy(() => import("./pages/teacher/Dashboard"));
const TeacherNotes = lazy(() => import("./pages/teacher/Notes"));
const TeacherAnalysis = lazy(() => import("./pages/teacher/Analysis"));
const TeacherProfile = lazy(() => import("./pages/teacher/Profile"));

const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const StudentRecommendations = lazy(() => import("./pages/student/Recommendations"));
const StudentNotes = lazy(() => import("./pages/student/StudentNotes"));
const StudentProfile = lazy(() => import("./pages/student/StudentProfile"));

const Loading = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <CircularProgress />
  </Box>
);

const load = (Component) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

const protectedLayout = (role) => (
  <Suspense fallback={<Loading />}>
    <ProtectedRoute requiredRole={role}>
      <DashboardLayout role={role} />
    </ProtectedRoute>
  </Suspense>
);

const redirect = (to) => <Navigate to={to} replace />;

export const router = createBrowserRouter([
  { path: "/", element: load(LandingPage) },
  { path: "/login", element: load(RoleSelection) },
  { path: "/login/:role", element: load(LoginForm) },
  {
    path: "/admin",
    element: protectedLayout("admin"),
    children: [
      { index: true, element: redirect("/admin/dashboard") },
      { path: "dashboard", element: load(AdminDashboard) },
      { path: "ai-hub", element: load(GlobalAIHub) },
      { path: "classes", element: load(AdminClasses) },
      { path: "teachers", element: load(AdminTeachers) },
      { path: "students", element: load(AdminStudents) },
      { path: "subjects", element: load(AdminSubjects) },
      { path: "ranking", element: load(AdminRanking) },
      { path: "alerts", element: load(AdminAlerts) },
      { path: "recommendations", element: load(AdminRecommendations) },
      { path: "notes", element: load(AdminNotes) },
      { path: "predict-notes", element: load(PredictNotes) },
      { path: "AIHub", element: redirect("/admin/ai-hub") },
      { path: "Classes", element: redirect("/admin/classes") },
      { path: "Enseignants", element: redirect("/admin/teachers") },
      { path: "Etudiants", element: redirect("/admin/students") },
      { path: "Matieres", element: redirect("/admin/subjects") },
      { path: "Classment", element: redirect("/admin/ranking") },
      { path: "Alerts", element: redirect("/admin/alerts") },
      { path: "Recommendations", element: redirect("/admin/recommendations") },
      { path: "AdminNotes", element: redirect("/admin/notes") },
      { path: "PredictNotes", element: redirect("/admin/predict-notes") },
    ],
  },
  {
    path: "/teacher",
    element: protectedLayout("teacher"),
    children: [
      { index: true, element: redirect("/teacher/dashboard") },
      { path: "dashboard", element: load(TeacherDashboard) },
      { path: "notes", element: load(TeacherNotes) },
      { path: "analysis", element: load(TeacherAnalysis) },
      { path: "profile", element: load(TeacherProfile) },
      { path: "Notes", element: redirect("/teacher/notes") },
      { path: "Analyse", element: redirect("/teacher/analysis") },
      { path: "Profile", element: redirect("/teacher/profile") },
    ],
  },
  {
    path: "/student",
    element: protectedLayout("student"),
    children: [
      { index: true, element: redirect("/student/dashboard") },
      { path: "dashboard", element: load(StudentDashboard) },
      { path: "notes", element: load(StudentNotes) },
      { path: "guidance", element: load(StudentRecommendations) },
      { path: "profile", element: load(StudentProfile) },
      { path: "Notes", element: redirect("/student/notes") },
      { path: "Guidance", element: redirect("/student/guidance") },
      { path: "StudentProfile", element: redirect("/student/profile") },
    ],
  },
]);
