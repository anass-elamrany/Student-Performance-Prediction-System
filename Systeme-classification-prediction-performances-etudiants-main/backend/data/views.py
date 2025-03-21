from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Avg, Count, F
from django.db import IntegrityError
from datetime import datetime, timedelta
import json
from .models import Utilisateur, Classe, Note, Performance, Alerte, Recommandation, Matiere
from .serializers import MatiereSerializer, UtilisateurSerializer, ClasseSerializer, NoteSerializer
from django.db.models import Avg, Count, Sum
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

# Helper Functions
def get_user_info_by_role(user):
    """
    Retourne les informations de l'utilisateur en fonction de son rôle.
    """
    if user.user_type == 'admin':
        return {
            'id': user.id,
            'username': user.username,
            'role': 'admin',
            'full_name': f"{user.first_name} {user.last_name}",
        }
    elif user.user_type == 'teacher':
        return {
            'id': user.id,
            'username': user.username,
            'role': 'teacher',
            'full_name': f"{user.first_name} {user.last_name}",
        }
    elif user.user_type == 'student':
        return {
            'id': user.id,
            'username': user.username,
            'role': 'student',
            'full_name': f"{user.first_name} {user.last_name}",
            'n_appogie': user.n_appogie,
            'classe_id': user.classe.id if user.classe else None,
            'classe_nom': user.classe.nom if user.classe else None,
        }
    return None

# Authentication Views
@api_view(['POST'])
def login_view(request):
    """
    Vue pour la connexion des utilisateurs.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role')
    
    user = authenticate(username=username, password=password)
    
    if user is not None and user.user_type == role:
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.user_type,
            }
        })
    else:
        return Response({
            'success': False,
            'message': 'Nom d\'utilisateur ou mot de passe invalide'
        }, status=401)

@api_view(['POST'])
def logout_view(request):
    """
    Vue pour la déconnexion des utilisateurs.
    """
    # Supprimer les tokens côté client (géré par le frontend)
    return Response({
        'success': True,
        'message': 'Déconnexion réussie'
    })

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """
    Vue pour obtenir les informations de l'utilisateur connecté.
    """
    user = request.user
    user_info = get_user_info_by_role(user)
    if user_info:
        return Response({
            'success': True,
            'user': user_info
        })
    else:
        return Response({
            'success': False,
            'message': 'Rôle utilisateur inconnu'
        }, status=403)

# Student Views
@csrf_exempt
def list_students(request):
    """
    Vue pour lister tous les étudiants.
    """
    if request.method == 'GET':
        students = Utilisateur.objects.filter(user_type='student')
        serializer = UtilisateurSerializer(students, many=True)
        return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def create_student(request):
    """
    Vue pour créer un étudiant.
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            classe = Classe.objects.get(nom=data['classes'][0]) if data.get('classes') else None
            student = Utilisateur.objects.create_user(
                username=data['email'],
                email=data['email'],
                password=data['n_appogie'],  # Use n_appogie as the password
                first_name=data['first_name'],
                last_name=data['last_name'],
                phone=data['phone'],
                n_appogie=data['n_appogie'],  # Set n_appogie
                classe=classe,
                user_type='student'
            )
            return JsonResponse({'success': True, 'id': student.id})
        except IntegrityError as e:
            return JsonResponse({'success': False, 'error': 'Le numéro Apogee doit être unique.'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
@csrf_exempt
def update_student(request, id):
    """
    Vue pour mettre à jour un étudiant.
    """
    if request.method == 'PUT':
        data = json.loads(request.body)
        try:
            student = Utilisateur.objects.get(id=id, user_type='student')
            # Check if n_appogie is being updated and if it's unique
            if 'n_appogie' in data and data['n_appogie'] != student.n_appogie:
                if Utilisateur.objects.filter(n_appogie=data['n_appogie']).exists():
                    return JsonResponse({'success': False, 'error': 'Le numéro Apogee doit être unique.'}, status=400)
                student.n_appogie = data['n_appogie']
                student.set_password(data['n_appogie'])  # Update password if n_appogie changes
            student.first_name = data.get('first_name', student.first_name)
            student.last_name = data.get('last_name', student.last_name)
            student.email = data.get('email', student.email)
            student.phone = data.get('phone', student.phone)
            student.classe = Classe.objects.get(nom=data['classes'][0]) if data.get('classes') else None
            student.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
@csrf_exempt
def delete_student(request, id):
    """
    Vue pour supprimer un étudiant.
    """
    if request.method == 'DELETE':
        try:
            student = Utilisateur.objects.get(id=id, user_type='student')
            student.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
import csv
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.uploadedfile import InMemoryUploadedFile
from .models import Utilisateur, Classe

@csrf_exempt
def import_students(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        if not file.name.endswith('.csv'):
            return JsonResponse({'success': False, 'error': 'Le fichier doit être un CSV.'}, status=400)

        try:
            decoded_file = file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded_file)

            for row in reader:
                classe = Classe.objects.get(nom=row['Classe']) if row.get('Classe') else None
                Utilisateur.objects.create_user(
                    username=row['Email'],
                    email=row['Email'],
                    password=row['Numéro Apogee'],
                    first_name=row['Prénom'],
                    last_name=row['Nom'],
                    phone=row['Téléphone'],
                    n_appogie=row['Numéro Apogee'],
                    classe=classe,
                    user_type='student'
                )

            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'success': False, 'error': 'Aucun fichier trouvé.'}, status=400)
# Teacher Views
@csrf_exempt
def list_enseignants(request):
    """
    Vue pour lister tous les enseignants.
    """
    if request.method == 'GET':
        enseignants = Utilisateur.objects.filter(user_type='teacher')
        serializer = UtilisateurSerializer(enseignants, many=True)
        return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def create_enseignant(request):
    """
    Vue pour créer un enseignant.
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            enseignant = Utilisateur.objects.create_user(
                username=data['email'],
                email=data['email'],
                password='defaultpassword',
                first_name=data['first_name'],
                last_name=data['last_name'],
                phone=data['phone'],
                user_type='teacher'
            )
            return JsonResponse({'success': True, 'id': enseignant.id})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def update_enseignant(request, id):
    """
    Vue pour mettre à jour un enseignant.
    """
    if request.method == 'PUT':
        data = json.loads(request.body)
        try:
            enseignant = Utilisateur.objects.get(id=id, user_type='teacher')
            enseignant.first_name = data.get('first_name', enseignant.first_name)
            enseignant.last_name = data.get('last_name', enseignant.last_name)
            enseignant.email = data.get('email', enseignant.email)
            enseignant.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def delete_enseignant(request, id):
    """
    Vue pour supprimer un enseignant.
    """
    if request.method == 'DELETE':
        try:
            enseignant = Utilisateur.objects.get(id=id, user_type='teacher')
            enseignant.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)


@csrf_exempt
def import_enseignants(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        if not file.name.endswith('.csv'):
            return JsonResponse({'success': False, 'error': 'Le fichier doit être un CSV.'}, status=400)

        try:
            decoded_file = file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded_file)

            for row in reader:
                Utilisateur.objects.create_user(
                    username=row['Email'],
                    email=row['Email'],
                    password='defaultpassword',  # Set a default password
                    first_name=row['Prénom'],
                    last_name=row['Nom'],
                    phone=row['Téléphone'],
                    user_type='teacher'
                )

            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'success': False, 'error': 'Aucun fichier trouvé.'}, status=400)
# Class Views
@csrf_exempt
def list_classes(request):
    """
    Vue pour lister toutes les classes.
    """
    if request.method == 'GET':
        classes = Classe.objects.all()
        serializer = ClasseSerializer(classes, many=True)
        return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def create_class(request):
    """
    Vue pour créer une classe.
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            enseignant_responsable = Utilisateur.objects.get(id=data['enseignant_responsable_id'], user_type='teacher')
            classe = Classe.objects.create(
                nom=data['nom'],
                enseignant_responsable=enseignant_responsable
            )
            return JsonResponse({'success': True, 'id': classe.id})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def update_class(request, id):
    """
    Vue pour mettre à jour une classe.
    """
    if request.method == 'PUT':
        data = json.loads(request.body)
        try:
            classe = Classe.objects.get(id=id)
            classe.nom = data.get('nom', classe.nom)
            if 'enseignant_responsable_id' in data:
                classe.enseignant_responsable = Utilisateur.objects.get(id=data['enseignant_responsable_id'], user_type='teacher')
            classe.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def delete_class(request, id):
    """
    Vue pour supprimer une classe.
    """
    if request.method == 'DELETE':
        try:
            classe = Classe.objects.get(id=id)
            classe.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

# Subject Views
@csrf_exempt
def list_matieres(request):
    """
    Vue pour lister toutes les matières.
    """
    if request.method == 'GET':
        matieres = Matiere.objects.all()
        serializer = MatiereSerializer(matieres, many=True)
        return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def create_matiere(request):
    """
    Vue pour créer une matière.
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            classe = Classe.objects.get(id=data['classe_id'])
            enseignant = Utilisateur.objects.get(id=data['enseignant_id'], user_type='teacher')
            matiere = Matiere.objects.create(
                nom=data['nom'],
                coefficient=data['coefficient'],
                semestre=data['semestre'],
                classe=classe,
                enseignant=enseignant
            )
            return JsonResponse({'success': True, 'id': matiere.id})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def update_matiere(request, id):
    """
    Vue pour mettre à jour une matière.
    """
    if request.method == 'PUT':
        data = json.loads(request.body)
        try:
            matiere = Matiere.objects.get(id=id)
            matiere.nom = data.get('nom', matiere.nom)
            matiere.coefficient = data.get('coefficient', matiere.coefficient)
            matiere.semestre = data.get('semestre', matiere.semestre)
            if 'classe_id' in data:
                matiere.classe = Classe.objects.get(id=data['classe_id'])
            if 'enseignant_id' in data:
                matiere.enseignant = Utilisateur.objects.get(id=data['enseignant_id'], user_type='teacher')
            matiere.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def delete_matiere(request, id):
    """
    Vue pour supprimer une matière.
    """
    if request.method == 'DELETE':
        try:
            matiere = Matiere.objects.get(id=id)
            matiere.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)


# Machine Learning Views
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Note, Utilisateur, Performance, Alerte, Recommandation, Matiere
from .ml_utils import train_classification_model, train_linear_regression_model

# Helper function to get notes for a student up to a specific semester
def get_notes_up_to_semester(student, subject_id, semester):
    """
    Récupère les notes d'un étudiant pour une matière jusqu'à un semestre donné.
    """
    return Note.objects.filter(
        etudiant=student,
        matiere_id=subject_id,
        matiere__semestre__lte=semester  # Notes jusqu'au semestre spécifié
    )

# Predict student performance
@csrf_exempt
def predict_student_performance(request):
    """
    Vue pour prédire la performance des étudiants pour une matière dans un semestre donné.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            class_id = data['class_id']
            semester = data['semester']
            subject_id = data['subject_id']

            # Exclure le semestre 1
            if semester == 1:
                return JsonResponse({'error': 'La prédiction n\'est pas disponible pour le semestre 1.'}, status=400)

            # Récupérer les étudiants de la classe
            students = Utilisateur.objects.filter(classe_id=class_id, user_type='student')

            # Récupérer les notes des étudiants pour la matière et les semestres précédents
            predictions = []
            for student in students:
                notes = get_notes_up_to_semester(student, subject_id, semester)
                if notes.exists():
                    # Préparer les données pour la prédiction
                    X = [[note.note_module, note.note_devoir_projet, note.assiduite, note.presence] for note in notes]
                    # Entraîner le modèle
                    model = train_linear_regression_model()
                    # Faire une prédiction
                    predicted_score = model.predict([X[-1]])[0]  # Utiliser les dernières données
                    predictions.append({
                        'student_id': student.id,
                        'student_name': f"{student.first_name} {student.last_name}",
                        'predicted_score': round(predicted_score, 2),
                    })

            return JsonResponse({'predictions': predictions})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

# Classify student performance
@csrf_exempt
def classify_students(request):
    """
    Vue pour classifier les étudiants en fonction de leurs performances dans une matière et un semestre donnés.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            class_id = data['class_id']
            semester = data['semester']
            subject_id = data['subject_id']

            # Exclure le semestre 1
            if semester == 1:
                return JsonResponse({'error': 'La classification n\'est pas disponible pour le semestre 1.'}, status=400)

            # Récupérer les étudiants de la classe
            students = Utilisateur.objects.filter(classe_id=class_id, user_type='student')

            # Récupérer les notes des étudiants pour la matière et les semestres précédents
            results = []
            for student in students:
                notes = get_notes_up_to_semester(student, subject_id, semester)
                if notes.exists():
                    # Préparer les données pour la classification
                    X = [[note.note_module, note.note_devoir_projet, note.assiduite, note.presence] for note in notes]
                    # Entraîner le modèle
                    model = train_classification_model()
                    # Faire une prédiction
                    prediction = model.predict([X[-1]])[0]  # Utiliser les dernières données
                    results.append({
                        'student_id': student.id,
                        'student_name': f"{student.first_name} {student.last_name}",
                        'performance_category': prediction,
                    })

            return JsonResponse({'results': results})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

# Generate alerts for at-risk students
@csrf_exempt
def generate_alerts(request):
    """
    Vue pour générer des alertes pour les étudiants à risque dans une matière et un semestre donnés.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            class_id = data['class_id']
            semester = data['semester']
            subject_id = data['subject_id']

            # Exclure le semestre 1
            if semester == 1:
                return JsonResponse({'error': 'Les alertes ne sont pas disponibles pour le semestre 1.'}, status=400)

            # Récupérer les étudiants de la classe
            students = Utilisateur.objects.filter(classe_id=class_id, user_type='student')

            # Récupérer les notes des étudiants pour la matière et les semestres précédents
            alerts = []
            for student in students:
                notes = get_notes_up_to_semester(student, subject_id, semester)
                if notes.exists():
                    # Préparer les données pour la classification
                    X = [[note.note_module, note.note_devoir_projet, note.assiduite, note.presence] for note in notes]
                    # Entraîner le modèle
                    model = train_classification_model()
                    # Faire une prédiction
                    prediction = model.predict([X[-1]])[0]  # Utiliser les dernières données

                    # Générer une alerte si l'étudiant est à risque
                    if prediction == 'À risque':
                        message = f"L'étudiant {student.first_name} {student.last_name} est à risque dans cette matière."
                        alerts.append({
                            'student_id': student.id,
                            'student_name': f"{student.first_name} {student.last_name}",
                            'performance_category': prediction,
                            'message': message,
                        })

                        # Enregistrer l'alerte dans la base de données
                        Alerte.objects.create(
                            etudiant=student,
                            message=message,
                        )

            return JsonResponse({'alerts': alerts})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

# Generate recommendations for students
@csrf_exempt
def generate_recommendations(request):
    """
    Vue pour générer des recommandations de cours ou de parcours pour les étudiants.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            class_id = data['class_id']
            semester = data['semester']
            subject_id = data['subject_id']

            # Restreindre les recommandations au semestre 4
            if semester != 4:
                return JsonResponse({'error': 'Les recommandations ne sont disponibles que pour le semestre 4.'}, status=400)

            # Récupérer les étudiants de la classe
            students = Utilisateur.objects.filter(classe_id=class_id, user_type='student')

            # Récupérer les notes des étudiants pour la matière et les semestres précédents
            recommendations = []
            for student in students:
                notes = get_notes_up_to_semester(student, subject_id, semester)
                if notes.exists():
                    # Préparer les données pour la classification
                    X = [[note.note_module, note.note_devoir_projet, note.assiduite, note.presence] for note in notes]
                    # Entraîner le modèle
                    model = train_classification_model()
                    # Faire une prédiction
                    prediction = model.predict([X[-1]])[0]  # Utiliser les dernières données

                    # Générer une recommandation si l'étudiant est à risque ou en moyenne performance
                    if prediction in ['À risque', 'Moyenne performance']:
                        # Récupérer les matières disponibles pour l'étudiant
                        matieres = Matiere.objects.filter(classe=student.classe, semestre=semester)
                        for matiere in matieres:
                            message = f"Nous vous recommandons de suivre le cours de {matiere.nom} pour améliorer vos performances."
                            recommendations.append({
                                'student_id': student.id,
                                'student_name': f"{student.first_name} {student.last_name}",
                                'performance_category': prediction,
                                'message': message,
                            })

                            # Enregistrer la recommandation dans la base de données
                            Recommandation.objects.create(
                                etudiant=student,
                                matiere=matiere,
                                contenu=message,
                            )

            return JsonResponse({'recommendations': recommendations})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)



# Fetch Matières by Class and Semester
@csrf_exempt
def get_matieres_by_class_semester(request):
    """
    Fetch matières for a specific class and semester.
    """
    if request.method == 'GET':
        classe_id = request.GET.get('classe_id')
        semestre = request.GET.get('semestre')
        
        if not classe_id or not semestre:
            return JsonResponse({'error': 'classe_id and semestre are required'}, status=400)
        
        matieres = Matiere.objects.filter(classe_id=classe_id, semestre=semestre)
        serializer = MatiereSerializer(matieres, many=True)
        return JsonResponse(serializer.data, safe=False)

# Fetch Attendance Data
@csrf_exempt
def get_attendance_data(request):
    if request.method == 'GET':
        classe_id = request.GET.get('classe_id')
        semestre = request.GET.get('semestre')
        
        if not classe_id or not semestre:
            return JsonResponse({'error': 'classe_id and semestre are required'}, status=400)
        
        # Calculate attendance rate for each student
        students = Utilisateur.objects.filter(classe_id=classe_id, user_type='student')
        attendance_data = []
        
        for student in students:
            notes = Note.objects.filter(etudiant=student, matiere__semestre=semestre)
            total_presence = notes.aggregate(total_presence=Sum('presence'))['total_presence'] or 0
            total_sessions = notes.count() * 100  # Assuming 100 is the max presence per session
            
            attendance_rate = (total_presence / total_sessions) * 100 if total_sessions > 0 else 0
            attendance_data.append({
                'student_id': student.id,
                'student_name': f"{student.first_name} {student.last_name}",
                'attendance_rate': round(attendance_rate, 2),
            })
        
        return JsonResponse({'attendance_data': attendance_data})
# Fetch Summary Stats
@csrf_exempt
def get_summary_stats(request):
    """
    Fetch summary statistics for a specific class and semester.
    """
    if request.method == 'GET':
        classe_id = request.GET.get('classe_id')
        semestre = request.GET.get('semestre')
        
        if not classe_id or not semestre:
            return JsonResponse({'error': 'classe_id and semestre are required'}, status=400)
        
        # Calculate average performance
        notes = Note.objects.filter(matiere__classe_id=classe_id, matiere__semestre=semestre)
        average_performance = notes.aggregate(avg_performance=Avg('note_module'))['avg_performance'] or 0
        
        # Calculate success rate
        success_rate = notes.filter(note_module__gte=10).count() / notes.count() * 100 if notes.count() > 0 else 0
        
        # Calculate at-risk students
        at_risk_students = notes.filter(note_module__lt=10).values('etudiant').distinct().count()
        
        # Calculate attendance rate
        total_presence = notes.aggregate(total_presence=Sum('presence'))['total_presence'] or 0
        total_sessions = notes.count() * 100  # Assuming 100 is the max presence per session
        attendance_rate = (total_presence / total_sessions) * 100 if total_sessions > 0 else 0
        
        return JsonResponse({
            'average_performance': round(average_performance, 2),
            'success_rate': round(success_rate, 2),
            'at_risk_students': at_risk_students,
            'attendance_rate': round(attendance_rate, 2),
        })
    
# Fetch Subjects Performance Data
@csrf_exempt
def get_subjects_performance(request):
    """
    Fetch subjects performance data.
    """
    if request.method == 'GET':
        try:
            # Calculate success rate for each subject
            matieres = Matiere.objects.all()
            subjects_performance = []
            
            for matiere in matieres:
                notes = Note.objects.filter(matiere=matiere)
                total_students = notes.count()
                if total_students > 0:
                    success_rate = notes.filter(note_module__gte=10).count() / total_students * 100
                    subjects_performance.append({
                        'subject': matiere.nom,
                        'success_rate': round(success_rate, 2),
                    })
            
            return JsonResponse({'subjects_performance': subjects_performance})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

# Fetch Attendance Data (Global)
@csrf_exempt
def get_global_attendance(request):
    """
    Fetch global attendance data.
    """
    if request.method == 'GET':
        try:
            # Calculate attendance rate for all students
            students = Utilisateur.objects.filter(user_type='student')
            attendance_data = []
            
            for student in students:
                notes = Note.objects.filter(etudiant=student)
                total_presence = notes.aggregate(total_presence=Sum('presence'))['total_presence'] or 0
                total_sessions = notes.count() * 100  # Assuming 100 is the max presence per session
                
                attendance_rate = (total_presence / total_sessions) * 100 if total_sessions > 0 else 0
                attendance_data.append({
                    'student_id': student.id,
                    'student_name': f"{student.first_name} {student.last_name}",
                    'attendance_rate': round(attendance_rate, 2),
                })
            
            return JsonResponse({'attendance_data': attendance_data})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

# Fetch Global Summary Stats
@csrf_exempt
def get_global_summary_stats(request):
    """
    Fetch global summary statistics.
    """
    if request.method == 'GET':
        try:
            # Calculate average performance
            notes = Note.objects.all()
            average_performance = notes.aggregate(avg_performance=Avg('note_module'))['avg_performance'] or 0
            
            # Calculate success rate
            success_rate = notes.filter(note_module__gte=10).count() / notes.count() * 100 if notes.count() > 0 else 0
            
            # Calculate at-risk students
            at_risk_students = notes.filter(note_module__lt=10).values('etudiant').distinct().count()
            
            # Calculate attendance rate
            total_presence = notes.aggregate(total_presence=Sum('presence'))['total_presence'] or 0
            total_sessions = notes.count() * 100  # Assuming 100 is the max presence per session
            attendance_rate = (total_presence / total_sessions) * 100 if total_sessions > 0 else 0
            
            return JsonResponse({
                'average_performance': round(average_performance, 2),
                'success_rate': round(success_rate, 2),
                'at_risk_students': at_risk_students,
                'attendance_rate': round(attendance_rate, 2),
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)













from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Utilisateur, Matiere, Note
from .serializers import MatiereSerializer, NoteSerializer
import csv
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Get Matieres for the logged-in teacher
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_matieres(request):
    if request.user.user_type != 'teacher':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    # Fetch matieres taught by the logged-in teacher
    matieres = Matiere.objects.filter(enseignant=request.user)
    serializer = MatiereSerializer(matieres, many=True)
    return Response({
        'success': True,
        'matieres': serializer.data
    })

# Get Notes for the logged-in teacher's Matieres
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_notes(request):
    if request.user.user_type != 'teacher':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    matiere_id = request.query_params.get('matiere_id')
    if not matiere_id:
        return Response({
            'success': False,
            'message': 'matiere_id est requis'
        }, status=400)

    # Ensure the matiere belongs to the logged-in teacher
    matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
    if not matiere:
        return Response({
            'success': False,
            'message': 'Matière non trouvée ou accès non autorisé'
        }, status=404)

    # Fetch notes for the selected matiere
    notes = Note.objects.filter(matiere=matiere)
    serializer = NoteSerializer(notes, many=True)
    return Response({
        'success': True,
        'notes': serializer.data
    })

# Create or Update a Note
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_or_update_note(request):
    """
    Vue pour créer ou mettre à jour une note.
    """
    if request.user.user_type != 'teacher':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    data = request.data
    matiere_id = data.get('matiere_id')
    etudiant_id = data.get('etudiant_id')

    # Check if the teacher teaches the Matiere
    matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
    if not matiere:
        return Response({
            'success': False,
            'message': 'Matière non trouvée ou accès non autorisé'
        }, status=404)

    # Check if the student is in the Matiere's class
    etudiant = Utilisateur.objects.filter(id=etudiant_id, user_type='student', classe=matiere.classe).first()
    if not etudiant:
        return Response({
            'success': False,
            'message': 'Étudiant non trouvé ou accès non autorisé'
        }, status=404)

    # Create or update the Note
    note, created = Note.objects.update_or_create(
        matiere=matiere,
        etudiant=etudiant,
        defaults={
            'note_module': data.get('note_module'),
            'note_devoir_projet': data.get('note_devoir_projet'),
            'assiduite': data.get('assiduite'),
            'presence': data.get('presence'),
        }
    )

    serializer = NoteSerializer(note)
    return Response({
        'success': True,
        'note': serializer.data,
        'message': 'Note créée/mise à jour avec succès'
    })

# Delete a Note
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_note(request, id):
    """
    Vue pour supprimer une note.
    """
    if request.user.user_type != 'teacher':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    note = Note.objects.filter(id=id, matiere__enseignant=request.user).first()
    if not note:
        return Response({
            'success': False,
            'message': 'Note non trouvée ou accès non autorisé'
        }, status=404)

    note.delete()
    return Response({
        'success': True,
        'message': 'Note supprimée avec succès'
    })

# Import Notes from CSV
@csrf_exempt
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def import_notes(request):
    """
    Vue pour importer des notes à partir d'un fichier CSV.
    """
    if request.user.user_type != 'teacher':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    if not request.FILES.get('file'):
        return Response({
            'success': False,
            'message': 'Aucun fichier trouvé'
        }, status=400)

    file = request.FILES['file']
    if not file.name.endswith('.csv'):
        return Response({
            'success': False,
            'message': 'Le fichier doit être un CSV'
        }, status=400)

    try:
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)

        for row in reader:
            matiere_id = row.get('matiere_id')
            etudiant_id = row.get('etudiant_id')

            # Check if the teacher teaches the Matiere
            matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
            if not matiere:
                continue

            # Check if the student is in the Matiere's class
            etudiant = Utilisateur.objects.filter(id=etudiant_id, user_type='student', classe=matiere.classe).first()
            if not etudiant:
                continue

            # Create or update the Note
            Note.objects.update_or_create(
                matiere=matiere,
                etudiant=etudiant,
                defaults={
                    'note_module': row.get('note_module'),
                    'note_devoir_projet': row.get('note_devoir_projet'),
                    'assiduite': row.get('assiduite'),
                    'presence': row.get('presence'),
                }
            )

        return Response({
            'success': True,
            'message': 'Notes importées avec succès'
        })
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=400)
    
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_students_by_matiere(request):
    if request.user.user_type != 'teacher':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    matiere_id = request.query_params.get('matiere_id')
    if not matiere_id:
        return Response({
            'success': False,
            'message': 'matiere_id est requis'
        }, status=400)

    # Ensure the matiere belongs to the logged-in teacher
    matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
    if not matiere:
        return Response({
            'success': False,
            'message': 'Matière non trouvée ou accès non autorisé'
        }, status=404)

    # Fetch students enrolled in the class associated with the matiere
    students = Utilisateur.objects.filter(classe=matiere.classe, user_type='student')
    serializer = UtilisateurSerializer(students, many=True)
    return Response({
        'success': True,
        'students': serializer.data
    })

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_classes(request):
    if request.user.user_type != 'teacher':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    # Fetch classes taught by the logged-in teacher
    classes = Classe.objects.filter(enseignant_responsable=request.user)
    serializer = ClasseSerializer(classes, many=True)
    return Response({
        'success': True,
        'classes': serializer.data
    })