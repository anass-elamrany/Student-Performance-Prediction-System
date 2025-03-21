import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
} from "@mui/material";
import { fetchWithTokenRefresh, logout } from "../../utils/auth"; // Import your auth utilities

const Profile = () => {
  const [teacher, setTeacher] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch teacher's data on component mount
  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const response = await fetchWithTokenRefresh("http://localhost:8000/api/teacher/profile/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Backend Response:", data); // Debugging
        setTeacher(data.data); // Ensure this matches the backend response structure
      } else {
        throw new Error("Failed to fetch profile data");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to fetch profile data",
        severity: "error",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      });
      return;
    }
  
    try {
      const response = await fetchWithTokenRefresh("http://localhost:8000/api/teacher/update-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ password }),
      });
  
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Password updated successfully",
          severity: "success",
        });
        setPassword("");
        setConfirmPassword("");
      } else {
        throw new Error("Failed to update password");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Profile
      </Typography>

      {/* Personal Information Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Personal Information
          </Typography>
          <TextField
            label="First Name"
            value={teacher.first_name}
            fullWidth
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            label="Last Name"
            value={teacher.last_name}
            fullWidth
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            value={teacher.email}
            fullWidth
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            label="Phone"
            value={teacher.phone}
            fullWidth
            disabled
          />
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Change Password
          </Typography>
          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handlePasswordChange}
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          // @ts-ignore
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;