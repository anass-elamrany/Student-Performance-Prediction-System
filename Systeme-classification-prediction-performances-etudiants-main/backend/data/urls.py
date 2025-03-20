from django.urls import path
from . import views
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

    # Subjects
    path('api/matieres/', views.list_matieres, name='list-matieres'),
    path('api/matieres/create/', views.create_matiere, name='create-matiere'),
    path('api/matieres/update/<int:id>/', views.update_matiere, name='update-matiere'),
    path('api/matieres/delete/<int:id>/', views.delete_matiere, name='delete-matiere'),

    # Teacher Dashboard
    path('api/get_enseignant_matieres/', views.get_enseignant_matieres, name='get_enseignant_matieres'),
    path('api/get_classe_students/<int:classe_id>/', views.get_classe_students, name='get_classe_students'),
    path('api/get_enseignant_matiere_classe/<int:classe_id>/', views.get_enseignant_matiere_classe, name='get_enseignant_matiere_classe'),
    path('api/notes/<int:student_id>/<int:matiere_id>/', views.get_student_notes, name='get_student_notes'),
    path('api/notes/update/<int:student_id>/<int:matiere_id>/', views.update_student_note, name='update_student_note'),
    
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
   
]