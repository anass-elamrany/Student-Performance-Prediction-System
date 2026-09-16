import csv
import logging

from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..models import Classe, Matiere, Utilisateur
from ..permissions import IsAdminUserType
from ..serializers import MatiereSerializer

logger = logging.getLogger(__name__)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def list_matieres(request):
    matieres = Matiere.objects.all()
    serializer = MatiereSerializer(matieres, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def create_matiere(request):
    data = request.data
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
        return Response({'success': True, 'id': matiere.id})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def update_matiere(request, id):
    data = request.data
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
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def delete_matiere(request, id):
    try:
        matiere = Matiere.objects.get(id=id)
        matiere.delete()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def get_all_matieres(request):
    matieres = Matiere.objects.all()
    serializer = MatiereSerializer(matieres, many=True)
    return Response({'success': True, 'matieres': serializer.data})


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def import_matieres(request):
    if not request.FILES.get('file'):
        return Response({'success': False, 'error': 'Aucun fichier trouvé.'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    logger.info(f"File received: {file.name}")

    if not file.name.endswith('.csv'):
        return Response({'success': False, 'error': 'Le fichier doit être un CSV.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)

        required_columns = ['Nom', 'Coefficient', 'Semestre', 'Classe', 'Email']
        if not all(column in reader.fieldnames for column in required_columns):
            return Response({'success': False, 'error': f'Le fichier CSV doit contenir les colonnes: {", ".join(required_columns)}.'}, status=status.HTTP_400_BAD_REQUEST)

        for row in reader:
            try:
                enseignant = Utilisateur.objects.get(email=row['Email'], user_type='teacher')
                classe = Classe.objects.get(nom=row['Classe'])

                Matiere.objects.create(
                    nom=row['Nom'],
                    coefficient=float(row['Coefficient']),
                    semestre=int(row['Semestre']),
                    classe=classe,
                    enseignant=enseignant
                )
            except Utilisateur.DoesNotExist:
                return Response({'success': False, 'error': f"Enseignant avec l'email {row['Email']} non trouvé."}, status=status.HTTP_400_BAD_REQUEST)
            except Classe.DoesNotExist:
                return Response({'success': False, 'error': f"Classe {row['Classe']} non trouvée."}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error processing row: {row}, Error: {e}")
                return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'success': True})
    except Exception as e:
        logger.error(f"Error processing file: {e}")
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
