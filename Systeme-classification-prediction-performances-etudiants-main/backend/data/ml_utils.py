from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LinearRegression
from .models import Note

def train_classification_model():
    """
    Entraîne un modèle de classification pour catégoriser les étudiants.
    """
    # Récupérer les données des notes
    notes = Note.objects.all()
    X = []
    y = []
    for note in notes:
        X.append([note.note_module, note.note_devoir_projet, note.assiduite, note.presence])
        # Catégoriser les étudiants en fonction de leur note moyenne
        if note.note_module >= 14:
            y.append('Bon performeur')
        elif note.note_module >= 10:
            y.append('Moyenne performance')
        else:
            y.append('À risque')

    # Entraîner le modèle
    model = DecisionTreeClassifier()
    model.fit(X, y)
    return model

def train_linear_regression_model():
    """
    Entraîne un modèle de régression linéaire pour prédire les notes futures.
    """
    # Récupérer les données des notes
    notes = Note.objects.all()
    X = []
    y = []
    for note in notes:
        X.append([note.note_module, note.note_devoir_projet, note.assiduite, note.presence])
        y.append(note.note_module)  # Prédire la note du module

    # Entraîner le modèle
    model = LinearRegression()
    model.fit(X, y)
    return model