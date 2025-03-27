import json
import csv
import logging
import datetime
from datetime import datetime, timedelta
from collections import defaultdict

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db import IntegrityError
from django.db.models import Avg, Count, Sum, Max, Case, When, Value, F, Q
from django.db.models.functions import TruncMonth

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Utilisateur, Classe, Matiere, Note, Performance, 
    Alerte, Recommandation
)
from .serializers import (
    MatiereSerializer, UtilisateurSerializer, ClasseSerializer, 
    NoteSerializer, AlerteSerializer, RecommandationSerializer
)
from .ml_utils import (
    classify_students, generate_risk_alerts, 
    generate_recommendations_for_class, predict_s3_s4_grades
)





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


from django.db.models import Avg, Count
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Note, Performance, Matiere, Utilisateur

@api_view(['GET'])
def get_performance_trend(request):
    """
    Retrieve overall performance trend
    """
    # Calculate average performance by month
    performance_data = Note.objects.annotate(
        month=TruncMonth('date_ajout')
    ).values('month').annotate(
        average=Avg('note_module')
    ).order_by('month')

    # Transform data for frontend
    chart_data = [
        {
            'month': entry['month'].strftime('%B %Y'),
            'average': round(entry['average'], 2)
        } for entry in performance_data
    ]

    return Response(chart_data)

@api_view(['GET'])
def get_attendance_rate(request):
    """
    Retrieve attendance rate data
    """
    # Calculate average attendance by month
    attendance_data = Note.objects.annotate(
        month=TruncMonth('date_ajout')
    ).values('month').annotate(
        rate=Avg('presence')
    ).order_by('month')

    # Transform data for frontend
    chart_data = [
        {
            'month': entry['month'].strftime('%B %Y'),
            'rate': round(entry['rate'], 2)
        } for entry in attendance_data
    ]

    return Response(chart_data)

@api_view(['GET'])
def get_category_distribution(request):
    """
    Retrieve student performance category distribution
    """
    # Count students in each risk category
    category_data = Performance.objects.values('categorie_risque').annotate(
        count=Count('etudiant')
    )

    # Color mapping for categories
    color_map = {
        'Faible': '#F44336',  # Red
        'Moyen': '#FFC107',   # Amber
        'Bon': '#4CAF50',     # Green
        'Excellent': '#2196F3'  # Blue
    }

    # Transform data for frontend
    chart_data = [
        {
            'name': entry['categorie_risque'],
            'value': entry['count'],
            'color': color_map.get(entry['categorie_risque'], '#9C27B0')
        } for entry in category_data
    ]

    return Response(chart_data)

@api_view(['GET'])
def get_subject_success_rate(request):
    """
    Retrieve success rate by subject
    """
    # Calculate success rate for each subject
    subject_data = Matiere.objects.annotate(
        success_rate=Avg('note__note_module')
    ).values('nom', 'success_rate')

    # Transform data for frontend
    chart_data = [
        {
            'subject': entry['nom'],
            'success_rate': round(entry['success_rate'], 2)
        } for entry in subject_data
    ]

    return Response(chart_data)

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
            # Use the phone number as the password
            password = data['phone']
            enseignant = Utilisateur.objects.create_user(
                username=data['email'],
                email=data['email'],
                password=password,  # Set password to phone number
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
        logger.info(f"File received: {file.name}")

        # Check if the file is a CSV
        if not file.name.endswith('.csv'):
            logger.error("File is not a CSV")
            return JsonResponse({'success': False, 'error': 'Le fichier doit être un CSV.'}, status=400)

        try:
            decoded_file = file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded_file)

            for row in reader:
                # Check for required fields
                if not all(key in row for key in ['Email', 'Prénom', 'Nom', 'Téléphone']):
                    logger.error("Missing required fields in CSV")
                    return JsonResponse({'success': False, 'error': 'Le fichier CSV doit contenir les colonnes: Email, Prénom, Nom, Téléphone.'}, status=400)

                # Check if the email already exists
                if Utilisateur.objects.filter(email=row['Email']).exists():
                    logger.warning(f"User with email {row['Email']} already exists")
                    continue  # Skip this row

                # Create the user
                password = row['Téléphone']  # Use phone number as the password
                Utilisateur.objects.create_user(
                    username=row['Email'],
                    email=row['Email'],
                    password=password,
                    first_name=row['Prénom'],
                    last_name=row['Nom'],
                    phone=row['Téléphone'],
                    user_type='teacher'
                )

            return JsonResponse({'success': True})
        except Exception as e:
            logger.error(f"Error processing file: {e}")
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


#notes view

# Get all Matieres (for admin)
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_all_matieres(request):
    if request.user.user_type != 'admin':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    matieres = Matiere.objects.all()
    serializer = MatiereSerializer(matieres, many=True)
    return Response({
        'success': True,
        'matieres': serializer.data
    })

# Get all Notes (for admin)
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_all_notes(request):
    if request.user.user_type != 'admin':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    matiere_id = request.query_params.get('matiere_id')
    if matiere_id:
        notes = Note.objects.filter(matiere_id=matiere_id)
    else:
        notes = Note.objects.all()

    serializer = NoteSerializer(notes, many=True)
    return Response({
        'success': True,
        'notes': serializer.data
    })

# Create or Update a Note (for admin)
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_create_or_update_note(request):
    if request.user.user_type != 'admin':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    data = request.data
    matiere_id = data.get('matiere_id')
    etudiant_id = data.get('etudiant_id')

    matiere = Matiere.objects.filter(id=matiere_id).first()
    if not matiere:
        return Response({
            'success': False,
            'message': 'Matière non trouvée'
        }, status=404)

    etudiant = Utilisateur.objects.filter(id=etudiant_id, user_type='student').first()
    if not etudiant:
        return Response({
            'success': False,
            'message': 'Étudiant non trouvé'
        }, status=404)

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

# Delete a Note (for admin)
@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_delete_note(request, id):
    if request.user.user_type != 'admin':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    note = Note.objects.filter(id=id).first()
    if not note:
        return Response({
            'success': False,
            'message': 'Note non trouvée'
        }, status=404)

    note.delete()
    return Response({
        'success': True,
        'message': 'Note supprimée avec succès'
    })
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_students_by_matiere_admin(request):
    if request.user.user_type != 'admin':
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

    # Fetch the matiere to get the associated class
    matiere = Matiere.objects.filter(id=matiere_id).first()
    if not matiere:
        return Response({
            'success': False,
            'message': 'Matière non trouvée'
        }, status=404)

    # Fetch students enrolled in the class associated with the matiere
    students = Utilisateur.objects.filter(classe=matiere.classe, user_type='student')
    serializer = UtilisateurSerializer(students, many=True)
    return Response({
        'success': True,
        'students': serializer.data
    })

@csrf_exempt
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_import_notes(request):
    if request.user.user_type != 'admin':
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
            print(f"Processing row: {row}")  # Debugging: Log each row
            matiere_id = row.get('matiere_id')
            etudiant_id = row.get('etudiant_id')

            # Check if the matiere exists
            matiere = Matiere.objects.filter(id=matiere_id).first()
            if not matiere:
                print(f"Matiere not found: {matiere_id}")
                continue

            # Check if the student exists
            etudiant = Utilisateur.objects.filter(id=etudiant_id, user_type='student').first()
            if not etudiant:
                print(f"Student not found: {etudiant_id}")
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
        print(f"Error: {e}")  # Debugging: Log the error
        return Response({
            'success': False,
            'message': str(e)
        }, status=400)

@csrf_exempt
def import_matieres(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        logger.info(f"File received: {file.name}")

        # Check if the file is a CSV
        if not file.name.endswith('.csv'):
            logger.error("File is not a CSV")
            return JsonResponse({'success': False, 'error': 'Le fichier doit être un CSV.'}, status=400)

        try:
            decoded_file = file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded_file)

            # Check for required columns
            required_columns = ['Nom', 'Coefficient', 'Semestre', 'Classe', 'Email']
            if not all(column in reader.fieldnames for column in required_columns):
                logger.error("Missing required columns in CSV")
                return JsonResponse({'success': False, 'error': f'Le fichier CSV doit contenir les colonnes: {", ".join(required_columns)}.'}, status=400)

            for row in reader:
                try:
                    # Find the teacher by email
                    enseignant = Utilisateur.objects.get(email=row['Email'], user_type='teacher')
                    classe = Classe.objects.get(nom=row['Classe'])

                    # Create the subject
                    Matiere.objects.create(
                        nom=row['Nom'],
                        coefficient=float(row['Coefficient']),
                        semestre=int(row['Semestre']),
                        classe=classe,
                        enseignant=enseignant
                    )
                except Utilisateur.DoesNotExist:
                    logger.error(f"Enseignant with email {row['Email']} not found")
                    return JsonResponse({'success': False, 'error': f"Enseignant avec l'email {row['Email']} non trouvé."}, status=400)
                except Classe.DoesNotExist:
                    logger.error(f"Classe {row['Classe']} not found")
                    return JsonResponse({'success': False, 'error': f"Classe {row['Classe']} non trouvée."}, status=400)
                except Exception as e:
                    logger.error(f"Error processing row: {row}, Error: {e}")
                    return JsonResponse({'success': False, 'error': str(e)}, status=400)

            return JsonResponse({'success': True})
        except Exception as e:
            logger.error(f"Error processing file: {e}")
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'success': False, 'error': 'Aucun fichier trouvé.'}, status=400)






#teacher dashboard
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



logger = logging.getLogger(__name__)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_statistics(request):
    try:
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
        if notes.exists():
            average_grade = notes.aggregate(Avg('note_module'))['note_module__avg']
            highest_grade = notes.aggregate(Max('note_module'))['note_module__max']
        else:
            average_grade = 0
            highest_grade = 0

        return Response({
            'success': True,
            'matiere_stats': [{
                'matiere_id': matiere.id,
                'matiere_nom': matiere.nom,
                'average_grade': round(average_grade, 2),
                'highest_grade': highest_grade,
            }]
        })

    except Exception as e:
        logger.error(f"Error in get_teacher_statistics: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': 'Une erreur est survenue lors de la récupération des statistiques'
        }, status=500)
    
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_grade_distribution(request):
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

    matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
    if not matiere:
        return Response({
            'success': False,
            'message': 'Matière non trouvée ou accès non autorisé'
        }, status=404)

    notes = Note.objects.filter(matiere=matiere)
    grade_distribution = [
        {'range': '0-5', 'count': notes.filter(note_module__gte=0, note_module__lte=5).count()},
        {'range': '6-10', 'count': notes.filter(note_module__gte=6, note_module__lte=10).count()},
        {'range': '11-15', 'count': notes.filter(note_module__gte=11, note_module__lte=15).count()},
        {'range': '16-20', 'count': notes.filter(note_module__gte=16, note_module__lte=20).count()},
    ]

    return Response({
        'success': True,
        'grade_distribution': grade_distribution,
    })


logger = logging.getLogger(__name__)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_alerts(request):
    """
    Vue pour récupérer les alertes pour une matière spécifique
    Retourne les étudiants à risque avec leurs informations
    """
    try:
        matiere_id = request.query_params.get('matiere_id')
        if not matiere_id:
            return Response({
                'success': False,
                'message': 'Le paramètre matiere_id est requis'
            }, status=400)

        # Vérifier que l'enseignant a accès à cette matière
        matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
        if not matiere:
            return Response({
                'success': False,
                'message': 'Matière non trouvée ou accès non autorisé'
            }, status=404)

        # Récupérer les alertes pour cette matière
        alerts = Alerte.objects.filter(matiere_id=matiere_id).select_related('etudiant')
        
        alerts_data = []
        for alert in alerts:
            # Calculer la moyenne de l'étudiant dans cette matière
            avg_score = Note.objects.filter(
                matiere_id=matiere_id,
                etudiant=alert.etudiant
            ).aggregate(avg_score=Avg('note_module'))['avg_score'] or 0

            alerts_data.append({
                'student_id': alert.etudiant.id,
                'student_name': f"{alert.etudiant.first_name} {alert.etudiant.last_name}",
                'message': alert.message,
                'performance_category': 'À risque',  # Comme c'est une alerte
                'average_score': round(float(avg_score), 2),
                'matiere_id': matiere_id,
                'matiere_name': matiere.nom
            })

        return Response({
            'success': True,
            'alerts': alerts_data
        })

    except Exception as e:
        logger.error(f"Erreur dans get_teacher_alerts: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': 'Une erreur est survenue lors de la récupération des alertes'
        }, status=500)
# Fetch Classifications for Teacher's Matières

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_classifications(request):
    """
    Vue pour récupérer les classifications des étudiants par matière
    Utilise les mêmes catégories que votre ML (À risque, Moyenne performance, Bon performeur)
    """
    try:
        if request.user.user_type != 'teacher':
            return Response({
                'success': False,
                'message': 'Accès non autorisé'
            }, status=403)

        matiere_id = request.query_params.get('matiere_id')
        if not matiere_id:
            return Response({
                'success': False,
                'message': 'Le paramètre matiere_id est requis'
            }, status=400)

        # Vérifier que l'enseignant a accès à cette matière
        matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
        if not matiere:
            return Response({
                'success': False,
                'message': 'Matière non trouvée ou accès non autorisé'
            }, status=404)

        # Récupérer les étudiants et leurs moyennes pour cette matière
        classifications = Note.objects.filter(
            matiere_id=matiere_id
        ).values('etudiant').annotate(
            average_score=Avg('note_module'),
            performance_category=Case(
                When(average_score__gte=16, then=Value('Bon performeur')),
                When(average_score__gte=12, then=Value('Moyenne performance')),
                default=Value('À risque'),
            )
        )

        # Récupérer les informations des étudiants
        classifications_data = []
        for classification in classifications:
            student = Utilisateur.objects.get(id=classification['etudiant'])
            classifications_data.append({
                'student_id': student.id,
                'student_name': f"{student.first_name} {student.last_name}",
                'performance_category': classification['performance_category'],
                'average_score': round(classification['average_score'], 2),
                'matiere_id': matiere_id,
                'matiere_name': matiere.nom
            })

        return Response({
            'success': True,
            'classifications': classifications_data
        })

    except Exception as e:
        logger.error(f"Erreur dans get_teacher_classifications: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': 'Une erreur est survenue lors de la récupération des classifications'
        }, status=500)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_recommendations(request):
    """
    Vue pour récupérer les recommandations par matière
    """
    try:
        if request.user.user_type != 'teacher':
            return Response({
                'success': False,
                'message': 'Accès non autorisé'
            }, status=403)

        matiere_id = request.query_params.get('matiere_id')
        if not matiere_id:
            return Response({
                'success': False,
                'message': 'Le paramètre matiere_id est requis'
            }, status=400)

        # Vérifier que l'enseignant a accès à cette matière
        matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
        if not matiere:
            return Response({
                'success': False,
                'message': 'Matière non trouvée ou accès non autorisé'
            }, status=404)

        # Récupérer les recommandations pour cette matière
        recommendations = Recommandation.objects.filter(
            matiere_id=matiere_id
        ).select_related('etudiant')

        # Organiser les recommandations par étudiant
        recommendations_dict = {}
        for rec in recommendations:
            if rec.etudiant.id not in recommendations_dict:
                recommendations_dict[rec.etudiant.id] = {
                    'student_id': rec.etudiant.id,
                    'student_name': f"{rec.etudiant.first_name} {rec.etudiant.last_name}",
                    'recommendations': []
                }
            recommendations_dict[rec.etudiant.id]['recommendations'].append({
                'message': rec.contenu,
                'type': 'matiere' if rec.matiere else 'general'
            })

        recommendations_data = list(recommendations_dict.values())

        return Response({
            'success': True,
            'recommendations': recommendations_data
        })

    except Exception as e:
        logger.error(f"Erreur dans get_teacher_recommendations: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': 'Une erreur est survenue lors de la récupération des recommandations'
        }, status=500)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def teacher_profile(request):
    """
    Vue pour récupérer les informations du profil de l'enseignant.
    """
    try:
        teacher = request.user  # Assuming the user is authenticated
        if teacher.user_type != 'teacher':
            return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)

        profile_data = {
            'first_name': teacher.first_name,
            'last_name': teacher.last_name,
            'email': teacher.email,
            'phone': teacher.phone,
        }
        return JsonResponse({'success': True, 'data': profile_data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@csrf_exempt
def update_teacher_password(request):
    """
    Vue pour mettre à jour le mot de passe de l'enseignant.
    """
    try:
        teacher = request.user  # Assuming the user is authenticated
        if teacher.user_type != 'teacher':
            return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)

        data = json.loads(request.body)
        new_password = data.get('password')

        if not new_password:
            return JsonResponse({'success': False, 'error': 'New password is required'}, status=400)

        teacher.set_password(new_password)
        teacher.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)















#students dahboard views

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_student_notes(request):
    if request.user.user_type != 'student':
        return Response({
            'success': False,
            'message': 'Accès non autorisé'
        }, status=403)

    # Fetch notes for the logged-in student
    notes = Note.objects.filter(etudiant=request.user)
    serializer = NoteSerializer(notes, many=True)
    return Response({
        'success': True,
        'notes': serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    """
    Improved version with better error handling and null checks
    """
    if not request.user.is_etudiant():
        return Response({
            'success': False,
            'message': 'Seuls les étudiants peuvent accéder à ce tableau de bord.'
        }, status=403)
    
    student = request.user
    
    try:
        # Initialize default response structure
        data = {
            'success': True,
            'name': f"{student.first_name or ''} {student.last_name or ''}".strip(),
            'currentAverage': 0.0,
            'attendanceRate': 0,
            'recentGrades': [],
            'monthlyPerformance': [],
            'subjectPerformance': [],
            'notifications': []
        }

        # Get all notes for the student
        notes = Note.objects.filter(etudiant=student).select_related('matiere')
        
        # 1. Calculate current average
        if notes.exists():
            avg_result = notes.aggregate(avg=Avg('note_module'))
            data['currentAverage'] = round(float(avg_result['avg'] or 0), 1)
            
            # 2. Calculate attendance rate (assuming presence is percentage)
            attendance_avg = notes.aggregate(avg=Avg('presence'))['avg']
            data['attendanceRate'] = round(float(attendance_avg or 0))

        # 3. Recent grades (last 3 notes)
        recent_notes = notes.order_by('-date_ajout')[:3]
        data['recentGrades'] = [{
            'course': note.matiere.nom if note.matiere else 'Unknown',
            'grade': note.note_module,
            'date': note.date_ajout.strftime('%d/%m/%Y') if note.date_ajout else ''
        } for note in recent_notes]

        # 4. Monthly performance (last 6 months)
        now = timezone.now()
        monthly_performance = []
        
        for i in range(5, -1, -1):
            month_start = now - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            
            month_avg = notes.filter(
                date_ajout__gte=month_start,
                date_ajout__lte=month_end
            ).aggregate(avg=Avg('note_module'))['avg'] or 0
            
            monthly_performance.append({
                'month': month_start.strftime('%b'),
                'average': round(float(month_avg), 1)
            })
        
        data['monthlyPerformance'] = monthly_performance

        # 5. Subject performance
        subjects = Matiere.objects.filter(note__etudiant=student).distinct()
        data['subjectPerformance'] = [{
            'name': sub.nom,
            'value': round(float(
                notes.filter(matiere=sub).aggregate(avg=Avg('note_module'))['avg'] or 0
            ), 1)
        } for sub in subjects]

        # 6. Notifications (alerts + recommendations)
        alerts = Alerte.objects.filter(etudiant=student)
        recommendations = Recommandation.objects.filter(etudiant=student)
        
        data['notifications'] = [
            *[{'type': 'alert', 'message': a.message} for a in alerts],
            *[{'type': 'info', 'message': r.contenu} for r in recommendations]
        ]

        return Response(data)
    
    except Exception as e:
        logger.error(f"Dashboard error for {student}: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': 'Une erreur est survenue lors du chargement du tableau de bord.'
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_recommendations(request):
    """
    API view for student's recommendations
    Returns all recommendations for the logged-in student
    """
    if not request.user.is_etudiant():
        return Response({
            'success': False,
            'message': 'Seuls les étudiants peuvent accéder à leurs recommandations.'
        }, status=403)
    
    try:
        student = request.user
        recommendations = Recommandation.objects.filter(etudiant=student).order_by('-date_creation')
        
        recommendations_data = []
        for recommendation in recommendations:
            matiere_data = None
            if recommendation.matiere:
                matiere_data = {
                    'id': recommendation.matiere.id,
                    'nom': recommendation.matiere.nom,
                    'semestre': recommendation.matiere.get_semestre_display()
                }
            
            recommendations_data.append({
                'id': recommendation.id,
                'matiere': matiere_data,
                'contenu': recommendation.contenu,
                'date_creation': recommendation.date_creation.strftime('%d/%m/%Y')
            })
        
        return Response({
            'success': True,
            'recommendations': recommendations_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Une erreur est survenue: {str(e)}'
        }, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_alerts(request):
    """
    API view for student's alerts
    Returns all alerts for the logged-in student
    """
    try:
        # Check if user is a student using the new method from the model
        if not request.user.is_etudiant():
            return Response({
                'success': False,
                'message': 'Seuls les étudiants peuvent accéder à leurs alertes.'
            }, status=403)
        
        student = request.user
        
        # Updated query to match the frontend's expectation
        alerts = Alerte.objects.filter(etudiant=student).order_by('-date_creation')
        
        alerts_data = []
        for alert in alerts:
            matiere_data = None
            
            # Add support for priority (assuming you might want to add this later)
            alerts_data.append({
                'id': alert.id,
                'titre': 'Alerte',  # Default title if not provided in model
                'contenu': alert.message,
                'priorite': 'Normale',  # Default priority
                'date_creation': alert.date_creation.strftime('%Y-%m-%dT%H:%M:%S'),  # ISO format
                'matiere': matiere_data
            })
        
        return Response({
            'success': True,
            'alerts': alerts_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Une erreur est survenue: {str(e)}'
        }, status=500)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Une erreur est survenue: {str(e)}'
        }, status=500)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def student_profile(request):
    """
    Vue pour récupérer les informations du profil de l'étudiant.
    """
    try:
        student = request.user  # Assuming the user is authenticated
        if student.user_type != 'student':
            return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)

        profile_data = {
            'first_name': student.first_name,
            'last_name': student.last_name,
            'email': student.email,
            'phone': student.phone,
            'n_appogie': student.n_appogie,  # Student-specific field
            'classe': student.classe.nom if student.classe else "Non assigné",  # Class name
        }
        return JsonResponse({'success': True, 'data': profile_data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@csrf_exempt
def update_student_password(request):
    """
    Vue pour mettre à jour le mot de passe de l'étudiant.
    """
    try:
        student = request.user  # Assuming the user is authenticated
        if student.user_type != 'student':
            return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)

        data = json.loads(request.body)
        new_password = data.get('password')

        if not new_password:
            return JsonResponse({'success': False, 'error': 'New password is required'}, status=400)

        student.set_password(new_password)
        student.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
    




# Machine Learning Views
@csrf_exempt
def classify_class_students(request):
    """
    Classifie tous les étudiants d'une classe spécifique
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            class_id = data.get('class_id')
            
            if not class_id:
                return JsonResponse({'error': 'class_id is required'}, status=400)
            
            results = classify_students(class_id)
            return JsonResponse({'students': results})
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def get_class_alerts(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            class_id = data.get('class_id')
            
            if not class_id:
                return JsonResponse({'error': 'class_id is required'}, status=400)
            
            alerts = generate_risk_alerts(class_id)
            print(f"Generated alerts: {alerts}")  # Add this logging
            
            return JsonResponse({'alerts': alerts})
        
        except Exception as e:
            print(f"Error in get_class_alerts: {str(e)}")  # Add this logging
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_class_recommendations(request):
    """
    Récupère les recommandations pour une classe spécifique
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            class_id = data.get('class_id')
            
            if not class_id:
                return JsonResponse({'error': 'class_id is required'}, status=400)
            
            recommendations = generate_recommendations_for_class(class_id)
            
            # Sauvegarder les recommandations en base de données
            for rec in recommendations:
                for detail in rec['recommendations']:
                    # Find the corresponding subject if applicable
                    matiere = None
                    if detail.get('type') == 'matiere':
                        try:
                            matiere_name = detail['message'].split(' ')[-1]
                            matiere = Matiere.objects.filter(nom__icontains=matiere_name).first()
                        except:
                            pass
                    
                    Recommandation.objects.create(
                        etudiant_id=rec['student_id'],
                        contenu=detail['message'],
                        matiere=matiere
                    )
            
            return JsonResponse({'recommendations': recommendations})
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .ml_utils import classify_students, generate_risk_alerts

@csrf_exempt
def class_dashboard(request):
    """Endpoint principal avec les 3 catégories"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            class_id = data.get('class_id')
            
            if not class_id:
                return JsonResponse({'error': 'class_id is required'}, status=400)
            
            classification = classify_students(class_id)
            
            stats = {
                'average_score': sum(s.get('average_score', 0) for s in classification) / len(classification) if classification else 0,
                'at_risk_count': sum(1 for s in classification if s['performance_category'] == 'À risque'),
                'good_performers': sum(1 for s in classification if s['performance_category'] == 'Bon performeur'),
                'total_students': len(classification)
            }
            
            alerts = generate_risk_alerts(class_id)
            
            return JsonResponse({
                'classification': classification,
                'statistics': stats,
                'alerts': alerts
            })
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)


@csrf_exempt
def predict_grades(request):
    """
    Endpoint pour prédictions sans doublons
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            class_id = data.get('class_id')
            
            if not class_id:
                return JsonResponse({'error': 'class_id required'}, status=400)
            
            predictions = predict_s3_s4_grades(class_id)
            
            if 'error' in predictions:
                return JsonResponse({'error': predictions['error']}, status=400)
                
            return JsonResponse(predictions)
        
        except Exception as e:
            logger.error(f"Error in predict_grades: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)