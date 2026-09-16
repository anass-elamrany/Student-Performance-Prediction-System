from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..models import Classe, Utilisateur
from ..permissions import IsAdminUserType
from ..serializers import ClasseSerializer


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def list_classes(request):
    classes = Classe.objects.all()
    serializer = ClasseSerializer(classes, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def create_class(request):
    data = request.data
    try:
        enseignant_responsable = Utilisateur.objects.get(id=data['enseignant_responsable_id'], user_type='teacher')
        classe = Classe.objects.create(
            nom=data['nom'],
            enseignant_responsable=enseignant_responsable
        )
        return Response({'success': True, 'id': classe.id})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def update_class(request, id):
    data = request.data
    try:
        classe = Classe.objects.get(id=id)
        classe.nom = data.get('nom', classe.nom)
        if 'enseignant_responsable_id' in data:
            classe.enseignant_responsable = Utilisateur.objects.get(id=data['enseignant_responsable_id'], user_type='teacher')
        classe.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def delete_class(request, id):
    try:
        classe = Classe.objects.get(id=id)
        classe.delete()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
