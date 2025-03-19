import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

# Load dataset
df = pd.read_csv("Fichier_avec_recommandations_uniques.csv")

# Drop unnecessary columns
IGNORED_COLUMNS = ['utilisateur_ptr_id', 'n_appogie', 'classe_id']
df = df.drop(columns=IGNORED_COLUMNS, errors='ignore')

# Normalize scores
scaler = MinMaxScaler()
score_columns = df.columns.difference(['assiduite', 'presence'])  # Only subject-related columns
df[score_columns] = scaler.fit_transform(df[score_columns])

# Normalize attendance & presence
df['assiduite'] = df['assiduite'] / 100
df['presence'] = df['presence'] / 100

# Save preprocessed data
df.to_csv("processed_data.csv", index=False)