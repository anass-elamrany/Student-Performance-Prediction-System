from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Utilisateur,Classe,Note,Performance,Alerte,Recommandation,Matiere
from .serializers import UtilisateurSerializer,ClasseSerializer
from django.db.models import Avg, Count, F
from datetime import datetime, timedelta

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            role = data.get('role')
            
            # Authenticate user
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                # Check if user has the correct role
                if (role == 'admin' and user.user_type == 'admin') or \
                   (role == 'teacher' and user.user_type == 'teacher') or \
                   (role == 'student' and user.user_type == 'student'):
                    
                    login(request, user)
                    
                    # Return user info based on role
                    if role == 'admin':
                        user_info = {
                            'id': user.id,
                            'username': user.username,
                            'role': 'admin',
                            'full_name': f"{user.first_name} {user.last_name}",
                        }
                    elif role == 'teacher':
                        user_info = {
                            'id': user.id,
                            'username': user.username,
                            'role': 'teacher',
                            'full_name': f"{user.first_name} {user.last_name}",
                        }
                    elif role == 'student':
                        student = user
                        user_info = {
                            'id': user.id,
                            'username': user.username,
                            'role': 'student',
                            'full_name': f"{user.first_name} {user.last_name}",
                            'n_appogie': student.n_appogie,
                            'classe_id': student.classe.id if student.classe else None,
                            'classe_nom': student.classe.nom if student.classe else None,
                        }
                    
                    return JsonResponse({
                        'success': True,
                        'message': 'Connexion réussie',
                        'user': user_info
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'message': "Vous n'avez pas les permissions pour ce rôle"
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
        user = request.user
        
        # Determine role and get role-specific info
        if user.user_type == 'admin':
            role = 'admin'
            user_info = {
                'id': user.id,
                'username': user.username,
                'role': role,
                'full_name': f"{user.first_name} {user.last_name}",
            }
        elif user.user_type == 'teacher':
            role = 'teacher'
            user_info = {
                'id': user.id,
                'username': user.username,
                'role': role,
                'full_name': f"{user.first_name} {user.last_name}",
            }
        elif user.user_type == 'student':
            role = 'student'
            student = user
            user_info = {
                'id': user.id,
                'username': user.username,
                'role': role,
                'full_name': f"{user.first_name} {user.last_name}",
                'n_appogie': student.n_appogie,
                'classe_id': student.classe.id if student.classe else None,
                'classe_nom': student.classe.nom if student.classe else None,
            }
        else:
            return JsonResponse({
                'success': False,
                'message': 'Rôle utilisateur inconnu'
            }, status=403)
        
        return JsonResponse({
            'success': True,
            'user': user_info
        })
    else:
        return JsonResponse({
            'success': False,
            'message': 'Non authentifié'
        }, status=401)

#the backend for Etudiants page
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .models import Utilisateur, Classe
from .serializers import UtilisateurSerializer

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
            # Assuming 'classes' in data is a list of class names
            classe = Classe.objects.get(nom=data['classes'][0]) if data['classes'] else None
            student = Utilisateur.objects.create_user(
                username=data['email'],  # Assuming email as username
                email=data['email'],
                password='defaultpassword',  # Set a default password or generate one
                first_name=data['prénom'],
                last_name=data['nom'],
                phone=data['téléphone'],
                n_appogie=data['numeroApogee'],
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
            student.first_name = data.get('prénom', student.first_name)
            student.last_name = data.get('nom', student.last_name)
            student.email = data.get('email', student.email)
            student.phone = data.get('téléphone', student.phone)
            student.n_appogie = data.get('numeroApogee', student.n_appogie)
            if data['classes']:
                classe = Classe.objects.get(nom=data['classes'][0])
                student.classe = classe
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
        
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Utilisateur, Classe, Matiere
from .serializers import EnseignantSerializer, ClasseSerializer
import json

# --------- ENSEIGNANT (Teacher) Functions ---------

@csrf_exempt
def list_enseignants(request):
    if request.method == 'GET':
        enseignants = Utilisateur.objects.filter(user_type='teacher')
        serializer = EnseignantSerializer(enseignants, many=True)
        return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def create_enseignant(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            enseignant = Utilisateur.objects.create_user(
                username=data['email'],
                email=data['email'],
                password='defaultpassword',  # Default password
                first_name=data['prénom'],
                last_name=data['nom'],
                phone=data['téléphone'],
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
            enseignant.first_name = data.get('prénom', enseignant.first_name)
            enseignant.last_name = data.get('nom', enseignant.last_name)
            enseignant.email = data.get('email', enseignant.email)
            enseignant.phone = data.get('téléphone', enseignant.phone)
            enseignant.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def delete_enseignant(request, id):
    if request.method == 'DELETE':
        try:
            enseignant = Utilisateur.objects.get(id=id, user_type='teacher')
            Matiere.objects.filter(enseignant=enseignant).delete()
            enseignant.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def assign_matiere_to_teacher(request, id):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            enseignant = Utilisateur.objects.get(id=id, user_type='teacher')
            for affectation in data.get('affectations', []):
                classe, _ = Classe.objects.get_or_create(nom=affectation['classe'])
                Matiere.objects.create(
                    nom=affectation['matière'],
                    classe=classe,
                    enseignant=enseignant,
                    coefficient=1.0,
                    semestre=1
                )
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

# --------- CLASSE (Class) Functions ---------

@csrf_exempt
def list_classes(request):
    if request.method == 'GET':
        classes = Classe.objects.all()
        serializer = ClasseSerializer(classes, many=True)
        return JsonResponse({'count': classes.count(), 'classes': serializer.data}, safe=False)

@csrf_exempt
def count_classes(request):
    if request.method == 'GET':
        return JsonResponse({'count': Classe.objects.count()})

@csrf_exempt
def create_class(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            classe = Classe.objects.create(
                nom=data['nom'],
                niveau=data['niveau'],
                année_scolaire=data['année_scolaire'],
                enseignant_responsable_id=data.get('enseignant_responsable_id')
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
            classe.niveau = data.get('niveau', classe.niveau)
            classe.année_scolaire = data.get('année_scolaire', classe.année_scolaire)
            classe.enseignant_responsable_id = data.get('enseignant_responsable_id', classe.enseignant_responsable_id)
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
