from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Avg, Count, F
from datetime import datetime, timedelta
import json
from .models import Utilisateur, Classe, Note, Performance, Alerte, Recommandation, Matiere
from .serializers import MatiereSerializer, UtilisateurSerializer, ClasseSerializer, NoteSerializer

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
                password='defaultpassword',
                first_name=data['first_name'],
                last_name=data['last_name'],
                phone=data['phone'],
                n_appogie=data['n_appogie'],
                classe=classe,
                user_type='student'
            )
            return JsonResponse({'success': True, 'id': student.id})
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
            student.first_name = data.get('first_name', student.first_name)
            student.last_name = data.get('last_name', student.last_name)
            student.email = data.get('email', student.email)
            student.phone = data.get('phone', student.phone)
            student.n_appogie = data.get('n_appogie', student.n_appogie)
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




# Teacher Dashboard Views
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_enseignant_matieres(request):
    """
    Vue pour obtenir les matières enseignées par l'enseignant connecté.
    """
    enseignant_id = request.user.id
    matieres = Matiere.objects.filter(enseignant_id=enseignant_id)
    
    # Sérialiser les matières
    serializer = MatiereSerializer(matieres, many=True)
    
    # Renvoyer un tableau, même vide
    return Response(serializer.data if matieres.exists() else [])

@csrf_exempt
def get_classe_students(request, classe_id):
    """
    Vue pour obtenir les étudiants d'une classe.
    """
    if request.method == 'GET':
        students = Utilisateur.objects.filter(classe_id=classe_id, user_type='student')
        serializer = UtilisateurSerializer(students, many=True)
        return JsonResponse(serializer.data, safe=False)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_enseignant_matiere_classe(request, classe_id):
    """
    Vue pour obtenir la matière enseignée par l'enseignant dans une classe spécifique.
    """
    enseignant_id = request.user.id
    matiere = Matiere.objects.filter(enseignant_id=enseignant_id, classe_id=classe_id).first()
    
    if matiere:
        serializer = MatiereSerializer(matiere)
        return Response(serializer.data)
    else:
        return Response({"error": "Aucune matière trouvée pour cette classe."}, status=404)

@csrf_exempt
def get_student_notes(request, student_id, matiere_id):
    """
    Vue pour obtenir les notes d'un étudiant pour une matière spécifique.
    """
    if request.method == 'GET':
        notes = Note.objects.filter(etudiant_id=student_id, matiere_id=matiere_id)
        serializer = NoteSerializer(notes, many=True)
        return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def update_student_note(request, student_id, matiere_id):
    """
    Vue pour créer ou mettre à jour les notes d'un étudiant.
    """
    if request.method == 'PUT':
        data = json.loads(request.body)
        try:
            note, created = Note.objects.get_or_create(
                etudiant_id=student_id,
                matiere_id=matiere_id,
                defaults={
                    'note_module': data.get('note_module', 0),
                    'note_devoir_projet': data.get('note_devoir_projet', 0),
                    'assiduite': data.get('assiduite', 0),
                    'presence': data.get('presence', 0),
                }
            )
            if not created:
                note.note_module = data.get('note_module', note.note_module)
                note.note_devoir_projet = data.get('note_devoir_projet', note.note_devoir_projet)
                note.assiduite = data.get('assiduite', note.assiduite)
                note.presence = data.get('presence', note.presence)
                note.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)



# Add these imports at the top of your views file
from django.db.models import Avg, Count, Sum
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
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