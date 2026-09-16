import csv
import logging

from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..models import Utilisateur
from ..permissions import IsAdminUserType
from ..serializers import UtilisateurSerializer

logger = logging.getLogger(__name__)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def list_enseignants(request):
    enseignants = Utilisateur.objects.filter(user_type='teacher')
    serializer = UtilisateurSerializer(enseignants, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def create_enseignant(request):
    data = request.data
    try:
        enseignant = Utilisateur.objects.create_user(
            username=data.get('email'),
            email=data.get('email'),
            password=data.get('phone'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            phone=data.get('phone'),
            user_type='teacher'
        )
        return Response({'success': True, 'id': enseignant.id})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def update_enseignant(request, id):
    data = request.data
    try:
        enseignant = Utilisateur.objects.get(id=id, user_type='teacher')
        enseignant.first_name = data.get('first_name', enseignant.first_name)
        enseignant.last_name = data.get('last_name', enseignant.last_name)
        enseignant.email = data.get('email', enseignant.email)
        enseignant.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def delete_enseignant(request, id):
    try:
        enseignant = Utilisateur.objects.get(id=id, user_type='teacher')
        enseignant.delete()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def import_enseignants(request):
    if not request.FILES.get('file'):
        return Response({'success': False, 'error': 'Aucun fichier trouvé.'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    logger.info(f"File received: {file.name}")

    if not file.name.endswith('.csv'):
        return Response({'success': False, 'error': 'Le fichier doit être un CSV.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)

        for row in reader:
            if not all(key in row for key in ['Email', 'Prénom', 'Nom', 'Téléphone']):
                return Response({'success': False, 'error': 'Le fichier CSV doit contenir les colonnes: Email, Prénom, Nom, Téléphone.'}, status=status.HTTP_400_BAD_REQUEST)

            if Utilisateur.objects.filter(email=row['Email']).exists():
                continue

            Utilisateur.objects.create_user(
                username=row['Email'],
                email=row['Email'],
                password=row['Téléphone'],
                first_name=row['Prénom'],
                last_name=row['Nom'],
                phone=row['Téléphone'],
                user_type='teacher'
            )

        return Response({'success': True})
    except Exception as e:
        logger.error(f"Error processing file: {e}")
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
