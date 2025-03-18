from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Utilisateur,Classe,Note,Performance,Alerte,Recommandation,Matiere,Classe
from .serializers import MatiereSerializer, UtilisateurSerializer,ClasseSerializer
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
            # Récupérer la classe si elle est fournie
            classe = None
            if data.get('classes') and len(data['classes']) > 0:
                classe = Classe.objects.get(nom=data['classes'][0])
            
            # Créer l'étudiant
            student = Utilisateur.objects.create_user(
                username=data['email'],  # Utiliser l'email comme nom d'utilisateur
                email=data['email'],
                password='defaultpassword',  # Mot de passe par défaut
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
            
            # Mettre à jour la classe si elle est fournie
            if data.get('classes') and len(data['classes']) > 0:
                classe = Classe.objects.get(nom=data['classes'][0])
                student.classe = classe
            else:
                student.classe = None
            
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
        


# Views for Enseignants
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



#Views for Classes
@csrf_exempt
def list_classes(request):
    if request.method == 'GET':
        classes = Classe.objects.all()  # Récupérez tous les objets Classe
        serializer = ClasseSerializer(classes, many=True)  # Sérialisez les objets
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
                enseignant_responsable = Utilisateur.objects.get(id=data['enseignant_responsable_id'], user_type='teacher')
                classe.enseignant_responsable = enseignant_responsable
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

#Views for Matières
@csrf_exempt
def list_classes(request):
    if request.method == 'GET':
        classes = Classe.objects.all()  # Récupérez tous les objets Classe
        serializer = ClasseSerializer(classes, many=True)  # Sérialisez les objets
        return JsonResponse(serializer.data, safe=False)


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
                classe = Classe.objects.get(id=data['classe_id'])
                matiere.classe = classe
            if 'enseignant_id' in data:
                enseignant = Utilisateur.objects.get(id=data['enseignant_id'], user_type='teacher')
                matiere.enseignant = enseignant
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