import csv

from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..models import Matiere, Note, Utilisateur
from ..permissions import IsAdminUserType
from ..serializers import NoteSerializer, UtilisateurSerializer


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def get_all_notes(request):
    matiere_id = request.query_params.get('matiere_id')
    if matiere_id:
        notes = Note.objects.filter(matiere_id=matiere_id)
    else:
        notes = Note.objects.all()

    serializer = NoteSerializer(notes, many=True)
    return Response({'success': True, 'notes': serializer.data})


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def admin_create_or_update_note(request):
    data = request.data
    matiere_id = data.get('matiere_id')
    etudiant_id = data.get('etudiant_id')

    matiere = Matiere.objects.filter(id=matiere_id).first()
    if not matiere:
        return Response({'success': False, 'message': 'Matière non trouvée'}, status=status.HTTP_404_NOT_FOUND)

    etudiant = Utilisateur.objects.filter(id=etudiant_id, user_type='student').first()
    if not etudiant:
        return Response({'success': False, 'message': 'Étudiant non trouvé'}, status=status.HTTP_404_NOT_FOUND)

    note, _ = Note.objects.update_or_create(
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


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def admin_delete_note(request, id):
    note = Note.objects.filter(id=id).first()
    if not note:
        return Response({'success': False, 'message': 'Note non trouvée'}, status=status.HTTP_404_NOT_FOUND)

    note.delete()
    return Response({'success': True, 'message': 'Note supprimée avec succès'})


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def get_students_by_matiere_admin(request):
    matiere_id = request.query_params.get('matiere_id')
    if not matiere_id:
        return Response({'success': False, 'message': 'matiere_id est requis'}, status=status.HTTP_400_BAD_REQUEST)

    matiere = Matiere.objects.filter(id=matiere_id).first()
    if not matiere:
        return Response({'success': False, 'message': 'Matière non trouvée'}, status=status.HTTP_404_NOT_FOUND)

    students = Utilisateur.objects.filter(classe=matiere.classe, user_type='student')
    serializer = UtilisateurSerializer(students, many=True)
    return Response({'success': True, 'students': serializer.data})


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUserType])
def admin_import_notes(request):
    if not request.FILES.get('file'):
        return Response({'success': False, 'message': 'Aucun fichier trouvé'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    if not file.name.endswith('.csv'):
        return Response({'success': False, 'message': 'Le fichier doit être un CSV'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)

        for row in reader:
            matiere_id = row.get('matiere_id')
            etudiant_id = row.get('etudiant_id')

            matiere = Matiere.objects.filter(id=matiere_id).first()
            if not matiere:
                continue

            etudiant = Utilisateur.objects.filter(id=etudiant_id, user_type='student').first()
            if not etudiant:
                continue

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

        return Response({'success': True, 'message': 'Notes importées avec succès'})
    except Exception as e:
        return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
