from django.test import TestCase
from rest_framework.test import APIClient

from .models import Classe, Matiere, Utilisateur


class RolePermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Utilisateur.objects.create_user(
            username="admin@example.com",
            email="admin@example.com",
            password="admin123",
            user_type="admin",
        )
        self.teacher = Utilisateur.objects.create_user(
            username="teacher@example.com",
            email="teacher@example.com",
            password="teacher123",
            user_type="teacher",
        )
        self.classe = Classe.objects.create(
            nom="GI-1",
            enseignant_responsable=self.teacher,
        )
        self.student = Utilisateur.objects.create_user(
            username="student@example.com",
            email="student@example.com",
            password="student123",
            user_type="student",
            classe=self.classe,
            n_appogie="A001",
        )
        self.matiere = Matiere.objects.create(
            nom="Mathematics",
            coefficient=2,
            semestre=1,
            classe=self.classe,
            enseignant=self.teacher,
        )

    def test_admin_can_access_admin_student_list(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/students/")

        self.assertEqual(response.status_code, 200)

    def test_teacher_cannot_access_admin_student_list(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get("/api/students/")

        self.assertEqual(response.status_code, 403)

    def test_student_cannot_access_teacher_notes(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f"/api/teacher/notes/?matiere_id={self.matiere.id}")

        self.assertEqual(response.status_code, 403)

    def test_student_can_access_own_dashboard(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get("/api/student/dashboard/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
