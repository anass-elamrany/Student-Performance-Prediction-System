from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Avg, Count, F
from datetime import datetime, timedelta
import json
from .models import Utilisateur, Classe, Note, Performance, Alerte, Recommandation, Matiere
from .serializers import MatiereSerializer, UtilisateurSerializer, ClasseSerializer
from .ml_utils.predict import predict_performance, classify_student

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
@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            role = data.get('role')
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None and user.user_type == role:
                login(request, user)
                user_info = get_user_info_by_role(user)
                if user_info:
                    return JsonResponse({
                        'success': True,
                        'message': 'Connexion réussie',
                        'user': user_info
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'message': "Rôle utilisateur inconnu"
                    }, status=403)
            else:
                return JsonResponse({
                    'success': False, 
                    'message': 'Nom d\'utilisateur ou mot de passe invalide'
                }, status=401)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Une erreur est survenue: {str(e)}'
            }, status=500)
    return JsonResponse({
        'success': False,
        'message': 'Méthode non autorisée'
    }, status=405)

@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({
        'success': True,
        'message': 'Déconnexion réussie'
    })

def get_user_info(request):
    if request.user.is_authenticated:
        user_info = get_user_info_by_role(request.user)
        if user_info:
            return JsonResponse({
                'success': True,
                'user': user_info
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Rôle utilisateur inconnu'
            }, status=403)
    return JsonResponse({
        'success': False,
        'message': 'Non authentifié'
    }, status=401)

# Student Views
@csrf_exempt
def list_students(request):
    if request.method == 'GET':
        students = Utilisateur.objects.filter(user_type='student')
        serializer = UtilisateurSerializer(students, many=True)
        return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def create_student(request):
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
    if request.method == 'GET':
        enseignants = Utilisateur.objects.filter(user_type='teacher')
        serializer = UtilisateurSerializer(enseignants, many=True)
        return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def create_enseignant(request):
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
    if request.method == 'GET':
        classes = Classe.objects.all()
        serializer = ClasseSerializer(classes, many=True)
        return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def create_class(request):
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
    if request.method == 'GET':
        matieres = Matiere.objects.all()
        serializer = MatiereSerializer(matieres, many=True)
        return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def create_matiere(request):
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
    if request.method == 'DELETE':
        try:
            matiere = Matiere.objects.get(id=id)
            matiere.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

# Machine Learning Views
@csrf_exempt
def predict_student_performance(request):
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