from rest_framework import serializers
from .models import *

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = '__all__'

class MatiereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matiere
        fields = ['id', 'nom', 'enseignant']

class ClasseSerializer(serializers.ModelSerializer):
    matieres = MatiereSerializer(many=True, read_only=True)
    enseignant_responsable = serializers.StringRelatedField()

    class Meta:
        model = Classe
        fields = ['id', 'nom', 'niveau', 'année_scolaire', 'enseignant_responsable', 'matieres']
from rest_framework import serializers
from .models import Utilisateur, Matiere, Classe

class AffectationSerializer(serializers.ModelSerializer):
    classe_nom = serializers.CharField(source='classe.nom', read_only=True)
    
    class Meta:
        model = Matiere
        fields = ['nom', 'classe_nom']

class EnseignantSerializer(serializers.ModelSerializer):
    affectations = AffectationSerializer(many=True, source='matieres_enseignees', read_only=True)
    
    class Meta:
        model = Utilisateur
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'affectations']
        
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'

class PerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Performance
        fields = '__all__'

class AlerteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerte
        fields = '__all__'

class RecommandationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommandation
        fields = '__all__'