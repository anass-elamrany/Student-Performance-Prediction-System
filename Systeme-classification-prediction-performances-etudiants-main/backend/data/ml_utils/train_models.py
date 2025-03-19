import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans

# Load preprocessed data
df = pd.read_csv("processed_data.csv")
score_columns = df.columns.difference(['assiduite', 'presence'])
student_profiles = df.drop(columns=['assiduite', 'presence'])

# Train Isolation Forest for risk detection
def calculate_risk_score(df):
    model = IsolationForest(contamination=0.1)
    risk_scores = model.fit_predict(student_profiles)
    df['risk_score'] = np.where(risk_scores == -1, 'High Risk', 'Low Risk')
    return df

df = calculate_risk_score(df)

# Train KMeans for clustering
kmeans = KMeans(n_clusters=3, random_state=42)
df['cluster'] = kmeans.fit_predict(student_profiles)

# Save the trained model results
df.to_csv("trained_model_results.csv", index=False)