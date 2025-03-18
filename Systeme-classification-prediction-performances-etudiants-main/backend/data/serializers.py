from rest_framework import serializers
from .models import *


class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'first_name', 'last_name']

class ClasseSerializer(serializers.ModelSerializer):
    enseignant_responsable = UtilisateurSerializer(read_only=True)

    class Meta:
        model = Classe
        fields = ['id', 'nom', 'enseignant_responsable']

class MatiereSerializer(serializers.ModelSerializer):
    classe = ClasseSerializer(read_only=True)  # Sérialise la classe
    classe_id = serializers.PrimaryKeyRelatedField(
        queryset=Classe.objects.all(),
        source='classe',
        write_only=True
    )
    enseignant = UtilisateurSerializer(read_only=True)  # Sérialise l'enseignant
    enseignant_id = serializers.PrimaryKeyRelatedField(
        queryset=Utilisateur.objects.filter(user_type='teacher'),
        source='enseignant',
        write_only=True
    )

    class Meta:
        model = Matiere
        fields = ['id', 'nom', 'coefficient', 'semestre', 'classe', 'classe_id', 'enseignant', 'enseignant_id']


class EnseignantSerializer(serializers.ModelSerializer):
    nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'first_name', 'last_name', 'nom']
    
    def get_nom(self, obj):
        return f"{obj.first_name} {obj.last_name}" if obj.first_name or obj.last_name else obj.username


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