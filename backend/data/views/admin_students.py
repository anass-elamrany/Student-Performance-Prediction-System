import csv

from django.db import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..models import Classe, Utilisateur
from ..permissions import IsAdminUserType
from ..serializers import UtilisateurSerializer


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def list_students(request):
    students = Utilisateur.objects.filter(user_type='student')
    serializer = UtilisateurSerializer(students, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def create_student(request):
    data = request.data
    try:
        classe = Classe.objects.get(nom=data.get('classes')[0]) if data.get('classes') else None
        student = Utilisateur.objects.create_user(
            username=data.get('email'),
            email=data.get('email'),
            password=str(data.get('n_appogie')),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            phone=data.get('phone'),
            n_appogie=data.get('n_appogie'),
            classe=classe,
            user_type='student'
        )
        return Response({'success': True, 'id': student.id})
    except IntegrityError:
        return Response({'success': False, 'error': 'Le numéro Apogee doit être unique.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def update_student(request, id):
    data = request.data
    try:
        student = Utilisateur.objects.get(id=id, user_type='student')
        if 'n_appogie' in data and data['n_appogie'] != student.n_appogie:
            if Utilisateur.objects.filter(n_appogie=data['n_appogie']).exists():
                return Response({'success': False, 'error': 'Le numéro Apogee doit être unique.'}, status=status.HTTP_400_BAD_REQUEST)
            student.n_appogie = data['n_appogie']
            student.set_password(str(data['n_appogie']))

        student.first_name = data.get('first_name', student.first_name)
        student.last_name = data.get('last_name', student.last_name)
        student.email = data.get('email', student.email)
        student.phone = data.get('phone', student.phone)
        student.classe = Classe.objects.get(nom=data.get('classes')[0]) if data.get('classes') else None
        student.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def delete_student(request, id):
    try:
        student = Utilisateur.objects.get(id=id, user_type='student')
        student.delete()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def import_students(request):
    if not request.FILES.get('file'):
        return Response({'success': False, 'error': 'Aucun fichier trouvé.'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    if not file.name.endswith('.csv'):
        return Response({'success': False, 'error': 'Le fichier doit être un CSV.'}, status=status.HTTP_400_BAD_REQUEST)

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

        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
