# backend/data/ml_utils/train_models.py
import joblib
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LinearRegression
from .data_preprocessing import prepare_data

def train_classification_model():
    X_train, X_test, y_train, y_test, scaler = prepare_data()

    # Définir les catégories de performance
    y_train_class = pd.cut(y_train, bins=[0, 10, 14, 20], labels=['à risque', 'moyen', 'bon'])
    y_test_class = pd.cut(y_test, bins=[0, 10, 14, 20], labels=['à risque', 'moyen', 'bon'])

    # Entraîner un modèle de classification
    classifier = DecisionTreeClassifier(random_state=42)
    classifier.fit(X_train, y_train_class)

    # Sauvegarder le modèle
    joblib.dump(classifier, 'backend/data/ml_models/classifier.pkl')

def train_regression_model():
    X_train, X_test, y_train, y_test, scaler = prepare_data()

    # Entraîner un modèle de régression
    regressor = LinearRegression()
    regressor.fit(X_train, y_train)

    # Sauvegarder le modèle
    joblib.dump(regressor, 'backend/data/ml_models/regressor.pkl')
    joblib.dump(scaler, 'backend/data/ml_models/scaler.pkl')  # Sauvegarder le scaler

if __name__ == "__main__":
    train_classification_model()
    train_regression_model()