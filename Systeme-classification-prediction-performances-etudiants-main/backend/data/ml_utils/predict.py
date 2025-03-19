# backend/data/ml_utils/predict.py
import joblib

def predict_performance(features):
    # Charger le modèle et le scaler
    regressor = joblib.load('backend/data/ml_models/regressor.pkl')
    scaler = joblib.load('backend/data/ml_models/scaler.pkl')

    # Normaliser les caractéristiques
    features = scaler.transform([features])

    # Faire la prédiction
    prediction = regressor.predict(features)
    return prediction[0]

def classify_student(features):
    # Charger le modèle et le scaler
    classifier = joblib.load('backend/data/ml_models/classifier.pkl')
    scaler = joblib.load('backend/data/ml_models/scaler.pkl')

    # Normaliser les caractéristiques
    features = scaler.transform([features])

    # Faire la classification
    category = classifier.predict(features)
    return category[0]