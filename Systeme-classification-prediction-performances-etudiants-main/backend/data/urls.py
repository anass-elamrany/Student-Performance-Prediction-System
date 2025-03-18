from django.urls import path
from . import views

urlpatterns = [
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/user-info/', views.get_user_info, name='user-info'),
    path('api/students/', views.list_students, name='list-students'),
    path('api/students/create/', views.create_student, name='create-student'),
    path('api/students/update/<int:id>/', views.update_student, name='update-student'),
    path('api/students/delete/<int:id>/', views.delete_student, name='delete-student'),
        # Enseignant (Teacher) URLs
    path('api/enseignants/', views.list_enseignants, name='list-enseignants'),
    path('api/enseignants/create/', views.create_enseignant, name='create-enseignant'),
    path('api/enseignants/update/<int:id>/', views.update_enseignant, name='update-enseignant'),
    path('api/enseignants/delete/<int:id>/', views.delete_enseignant, name='delete-enseignant'),
    path('api/enseignants/assign/<int:id>/', views.assign_matiere_to_teacher, name='assign-matiere-to-teacher'),

    # Classe (Class) URLs
    path('api/classes/', views.list_classes, name='list-classes'),
    path('api/classes/count/', views.count_classes, name='count-classes'),
    path('api/classes/create/', views.create_class, name='create-class'),
    path('api/classes/update/<int:id>/', views.update_class, name='update-class'),
    path('api/classes/delete/<int:id>/', views.delete_class, name='delete-class'),
]