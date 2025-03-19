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
def generate_alert(etudiant_id, message):
    """
    Génère une alerte pour un étudiant.
    """
    etudiant = Utilisateur.objects.get(id=etudiant_id, user_type='student')
    Alerte.objects.create(
        etudiant=etudiant,
        message=message,
        date_creation=timezone.now()
    )

def generate_recommendation(etudiant_id, matiere_id, contenu):
    """
    Génère une recommandation pour un étudiant dans une matière spécifique.
    """
    etudiant = Utilisateur.objects.get(id=etudiant_id, user_type='student')
    matiere = Matiere.objects.get(id=matiere_id)
    Recommandation.objects.create(
        etudiant=etudiant,
        matiere=matiere,
        contenu=contenu,
        date_creation=timezone.now()
    )

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

# Machine Learning Views
@csrf_exempt
def predict_student_performance(request):
    """
    Vue pour prédire la performance d'un étudiant.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            features = [
                data['etudiant_id'],
                data['matiere_id'],
                data['note_devoir_projet'],
                data['assiduite'],
                data['presence'],
            ]
            prediction = predict_performance(features)
            return JsonResponse({'predicted_score': prediction})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

@csrf_exempt
def classify_student_performance(request):
    """
    Vue pour classifier la performance d'un étudiant.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            features = [
                data['etudiant_id'],
                data['matiere_id'],
                data['note_devoir_projet'],
                data['assiduite'],
                data['presence'],
            ]
            category = classify_student(features)
            if category == 'à risque':
                generate_recommendation(
                    data['etudiant_id'],
                    data['matiere_id'],
                    "Nous vous recommandons de suivre des cours de rattrapage et de consulter les ressources supplémentaires."
                )
            return JsonResponse({'performance_category': category})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)