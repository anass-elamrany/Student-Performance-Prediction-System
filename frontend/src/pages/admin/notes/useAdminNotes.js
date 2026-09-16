import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../../../config";
import { fetchWithTokenRefresh, getUserRole } from "../../../utils/auth";

const emptyFormData = {
  id: null,
  matiere_id: "",
  etudiant_id: "",
  note_module: "",
  note_devoir_projet: "",
  assiduite: "",
  presence: "",
};

const mapNotesToStudents = (notes, students) => notes.map((note) => {
  const student = students.find((item) => item.id === note.etudiant);
  return {
    ...note,
    etudiant: student || { id: note.etudiant },
  };
});

export const useAdminNotes = () => {
  const [notes, setNotes] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const notify = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchMatieres = useCallback(async () => {
    try {
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/admin/matieres/`);
      const data = await response.json();
      if (data.success) {
        setMatieres(data.matieres);
      }
    } catch (error) {
      console.error("Error fetching matieres:", error);
      notify("Failed to fetch data", "error");
    }
  }, [notify]);

  const refreshSelectedMatiere = useCallback(async () => {
    if (!selectedMatiere) {
      setStudents([]);
      setNotes([]);
      return;
    }

    setLoading(true);
    try {
      const [studentsResponse, notesResponse] = await Promise.all([
        fetchWithTokenRefresh(`${API_BASE_URL}/admin/students-by-matiere/?matiere_id=${selectedMatiere}`),
        fetchWithTokenRefresh(`${API_BASE_URL}/admin/notes/?matiere_id=${selectedMatiere}`),
      ]);

      const studentsData = await studentsResponse.json();
      const notesData = await notesResponse.json();
      const nextStudents = studentsData.success ? studentsData.students : [];

      if (studentsData.success) {
        setStudents(nextStudents);
      }

      if (notesData.success) {
        setNotes(mapNotesToStudents(notesData.notes, nextStudents));
      }
    } catch (error) {
      console.error("Error fetching notes data:", error);
      notify("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  }, [notify, selectedMatiere]);

  useEffect(() => {
    const userRole = getUserRole();
    if (userRole !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    fetchMatieres().finally(() => setLoading(false));
  }, [fetchMatieres]);

  useEffect(() => {
    refreshSelectedMatiere();
  }, [refreshSelectedMatiere]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const csvFormData = new FormData();
    csvFormData.append("file", file);

    try {
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/admin/notes/import/`, {
        method: "POST",
        body: csvFormData,
      });
      const data = await response.json();

      if (response.ok) {
        await refreshSelectedMatiere();
        notify(data.message || "Grades imported successfully", "success");
      } else {
        throw new Error(data.message || "Failed to import CSV file");
      }
    } catch (error) {
      notify(error.message || "Une erreur est survenue", "error");
    } finally {
      event.target.value = "";
    }
  };

  const downloadTemplate = () => {
    if (!selectedMatiere) {
      notify("Select a subject before downloading the template", "warning");
      return;
    }

    const headers = [
      "matiere_id",
      "etudiant_id",
      "etudiant_nom",
      "note_module",
      "note_devoir_projet",
      "assiduite",
      "presence",
    ];
    const csvContent = [
      headers.join(","),
      ...students.map((student) => [
        selectedMatiere,
        student.id,
        `${student.first_name} ${student.last_name}`,
        "", "", "", "",
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `template_notes_${selectedMatiere}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenDialog = (note = null) => {
    if (note) {
      setFormData({
        id: note.id,
        matiere_id: note.matiere?.id || selectedMatiere,
        etudiant_id: note.etudiant?.id || "",
        note_module: note.note_module || "",
        note_devoir_projet: note.note_devoir_projet || "",
        assiduite: note.assiduite || "",
        presence: note.presence || "",
      });
      setEditMode(true);
    } else {
      setFormData({
        ...emptyFormData,
        matiere_id: selectedMatiere,
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/admin/notes/create-update/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        await refreshSelectedMatiere();
        notify(data.message || "Grade saved successfully", "success");
        handleCloseDialog();
      } else {
        throw new Error(data.message || "Request failed");
      }
    } catch (error) {
      notify(error.message || "Une erreur est survenue", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/admin/notes/delete/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        await refreshSelectedMatiere();
        notify("Grade deleted successfully", "info");
      } else {
        throw new Error("Failed to delete grade");
      }
    } catch (error) {
      notify(error.message || "Une erreur est survenue", "error");
    }
  };

  const closeSnackbar = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  return {
    closeSnackbar,
    downloadTemplate,
    editMode,
    formData,
    handleCloseDialog,
    handleDelete,
    handleFileUpload,
    handleInputChange,
    handleOpenDialog,
    handleSubmit,
    loading,
    matieres,
    notes,
    openDialog,
    selectedMatiere,
    setSelectedMatiere,
    snackbar,
    students,
  };
};
