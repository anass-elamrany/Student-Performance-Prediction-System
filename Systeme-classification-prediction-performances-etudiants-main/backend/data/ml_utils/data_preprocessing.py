# backend/data/ml_utils/data_preprocessing.py
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from ..models import Note, Utilisateur

def prepare_data():
    # Récupérer les données depuis la base de données Django
    notes = Note.objects.all().values('etudiant_id', 'matiere_id', 'note_module', 'note_devoir_projet', 'assiduite', 'presence')
    df = pd.DataFrame.from_records(notes)

    # Encoder les variables catégorielles
    df['etudiant_id'] = LabelEncoder().fit_transform(df['etudiant_id'])
    df['matiere_id'] = LabelEncoder().fit_transform(df['matiere_id'])

    # Séparer les caractéristiques (X) et la cible (y)
    X = df.drop(columns=['note_module'])  # Caractéristiques
    y = df['note_module']  # Cible (note finale)

    # Diviser les données en ensembles d'entraînement et de test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Normaliser les données
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    return X_train, X_test, y_train, y_test, scaler