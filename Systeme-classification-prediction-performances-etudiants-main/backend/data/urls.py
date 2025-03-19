from django.urls import path
from . import views
from .views import predict_student_performance, classify_student_performance
urlpatterns = [
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/user-info/', views.get_user_info, name='user-info'),
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

    # Enseignants
    path('api/enseignants/', views.list_enseignants, name='list-enseignants'),
    path('api/enseignants/create/', views.create_enseignant, name='create-enseignant'),
    path('api/enseignants/update/<int:id>/', views.update_enseignant, name='update-enseignant'),
    path('api/enseignants/delete/<int:id>/', views.delete_enseignant, name='delete-enseignant'),

    # Matières
    path('api/matieres/', views.list_matieres, name='list-matieres'),
    path('api/matieres/create/', views.create_matiere, name='create-matiere'),
    path('api/matieres/update/<int:id>/', views.update_matiere, name='update-matiere'),
    path('api/matieres/delete/<int:id>/', views.delete_matiere, name='delete-matiere'),


    path('api/predict-performance/', predict_student_performance, name='predict-performance'),
    path('api/classify-student/', classify_student_performance, name='classify-student'),
   
]