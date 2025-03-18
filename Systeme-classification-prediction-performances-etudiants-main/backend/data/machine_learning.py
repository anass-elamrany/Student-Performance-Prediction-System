import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier


df= pd.read_csv("Fichier_avec_recommandations_uniques.csv")

# Séparer les features et la cible
X = df.drop(columns=["recommendation"])
y = df["recommendation"]


# Encoder les colonnes catégorielles
encoder = LabelEncoder()
y = encoder.fit_transform(y)  # Encoder la colonne cible

# Normaliser les colonnes numériques
scaler = StandardScaler()
X = scaler.fit_transform(X)

# Diviser les données
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Entraîner le modèle
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Fonction pour obtenir les valeurs de l'utilisateur et prédire
def predict_recommendation():
    user_data = []
    print("\nVeuillez entrer les valeurs demandées :")
    
    columns = [
        "utilisateur_ptr_id", "n_appogie", "classe_id", "ANALYSE", "PROBA",
        "Architecture", "Systèmes d'exploitation", "Réseaux informatiques",
        "Algèbre linéaire", "Statistique", "base de donnees", "C", "python",
        "note_devoir_projet", "assiduite", "presence"
    ]

    for col in columns:
        value = float(input(f"{col} : "))  # Demander la valeur et la convertir en float
        user_data.append(value)

    # Transformer en DataFrame
    user_df = pd.DataFrame([user_data], columns=columns)

    # Normaliser les valeurs
    user_df = scaler.transform(user_df)

    # Faire la prédiction
    prediction = model.predict(user_df)[0]
    print(f"\nRecommandation : {encoder.inverse_transform([prediction])[0]}")

# Exécuter la fonction
predict_recommendation()
