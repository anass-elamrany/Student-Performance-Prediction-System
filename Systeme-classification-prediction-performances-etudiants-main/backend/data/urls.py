from django.urls import path
from . import views
from .views import student_dashboard
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Authentication
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/user-info/', views.get_user_info, name='user-info'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Students
    path('api/students/', views.list_students, name='list-students'),
    path('api/students/create/', views.create_student, name='create-student'),
    path('api/students/update/<int:id>/', views.update_student, name='update-student'),
    path('api/students/delete/<int:id>/', views.delete_student, name='delete-student'),
    path('api/students/import/', views.import_students, name='import_students'),

    # Classes
    path('api/classes/', views.list_classes, name='list-classes'),
    path('api/classes/create/', views.create_class, name='create-class'),
    path('api/classes/update/<int:id>/', views.update_class, name='update-class'),
    path('api/classes/delete/<int:id>/', views.delete_class, name='delete-class'),

    # Teachers
    path('api/enseignants/', views.list_enseignants, name='list-enseignants'),
    path('api/enseignants/create/', views.create_enseignant, name='create-enseignant'),
    path('api/enseignants/update/<int:id>/', views.update_enseignant, name='update-enseignant'),
    path('api/enseignants/delete/<int:id>/', views.delete_enseignant, name='delete-enseignant'),
    path('api/enseignants/import/', views.import_enseignants, name='import_enseignants'),

    # Subjects
    path('api/matieres/', views.list_matieres, name='list-matieres'),
    path('api/matieres/create/', views.create_matiere, name='create-matiere'),
    path('api/matieres/update/<int:id>/', views.update_matiere, name='update-matiere'),
    path('api/matieres/delete/<int:id>/', views.delete_matiere, name='delete-matiere'),
    path('api/matieres/import/', views.import_matieres, name='import-matieres'),

    #notes
    path('api/admin/matieres/', views.get_all_matieres, name='get_all_matieres'),
    path('api/admin/notes/', views.get_all_notes, name='get_all_notes'),
    path('api/admin/students-by-matiere/', views.get_students_by_matiere_admin, name='get_students_by_matiere_admin'),
    path('api/admin/notes/create-update/', views.admin_create_or_update_note, name='admin_create_or_update_note'),
    path('api/admin/notes/delete/<int:id>/', views.admin_delete_note, name='admin_delete_note'),
    path('api/admin/notes/import/', views.admin_import_notes, name='admin_import_notes'),
    # Machine Learning
    path('api/classify-students/', views.classify_students, name='classify-students'),
    path('api/predict-performance/', views.predict_student_performance, name='predict-performance'),
    path('api/generate-alerts/', views.generate_alerts, name='generate-alerts'),
    path('api/generate-recommendations/', views.generate_recommendations, name='generate-recommendations'),

    # New URLs for AdminDashboard
    path('api/matieres/by_class_semester/', views.get_matieres_by_class_semester, name='get_matieres_by_class_semester'),
    path('api/attendance/', views.get_attendance_data, name='get_attendance_data'),
    path('api/summary_stats/', views.get_summary_stats, name='get_summary_stats'),
    path('api/subjects-performance/', views.get_subjects_performance, name='get_subjects_performance'),
    path('api/global-attendance/', views.get_global_attendance, name='get_global_attendance'),
    path('api/summary_stats/', views.get_global_summary_stats, name='get_global_summary_stats'),

    # Teacher Dashboard
    path('api/teacher/matieres/', views.get_teacher_matieres, name='get_teacher_matieres'),
    path('api/teacher/notes/', views.get_teacher_notes, name='get_teacher_notes'),
    path('api/teacher/notes/create-update/', views.create_or_update_note, name='create_or_update_note'),
    path('api/teacher/notes/delete/<int:id>/', views.delete_note, name='delete_note'),
    path('api/teacher/notes/import/', views.import_notes, name='import_notes'),
    path('api/teacher/classes/', views.get_teacher_classes, name='get_teacher_classes'),
    path('api/teacher/students-by-matiere/', views.get_students_by_matiere, name='get_students_by_matiere'),

    path('api/teacher/statistics/', views.get_teacher_statistics, name='get_teacher_statistics'),
    path('api/teacher/grade-distribution/', views.get_grade_distribution, name='get_grade_distribution'),
    path('api/teacher/weekly-attendance/', views.get_weekly_attendance, name='get_weekly_attendance'),
    path('api/teacher/alerts/', views.get_teacher_alerts, name='get_teacher_alerts'),
    path('api/teacher/classifications/', views.get_teacher_classifications, name='get_teacher_classifications'),
    path('api/teacher/predictions/', views.get_teacher_predictions, name='get_teacher_predictions'),
    path('api/teacher/recommendations/', views.get_teacher_recommendations, name='get_teacher_recommendations'),
    path('api/teacher/profile/', views.teacher_profile, name='teacher-profile'),
    path('api/teacher/update-password/', views.update_teacher_password, name='update-teacher-password'),
     
    # Student Dashboard
    path('api/student/notes/', views.get_student_notes, name='get_student_notes'),
    path('api/student/dashboard/', views.student_dashboard, name='student_dashboard'),
    path('api/student/recommendations/', views.student_recommendations, name='student_recommendations'),
    path('api/student/alerts/', views.student_alerts, name='student_alerts'),
    path('api/student/profile/', views.student_profile, name='student-profile'),
    path('api/student/update-password/', views.update_student_password, name='update-student-password'),
]