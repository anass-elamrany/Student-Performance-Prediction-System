import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans

df = pd.read_csv("trained_model_results.csv")
score_columns = df.columns.difference(['assiduite', 'presence', 'risk_score', 'cluster'])

def generate_recommendations(student_index, df, threshold=0.5):
    SUBJECT_RESOURCES = {
        'ANALYSE': ["Book: Mathematical Analysis Basics", "Course: Intro to Analysis (Coursera)"],
        'PROBA': ["Tutorial: Probability Fundamentals (Khan Academy)", "Workshop: Probability Problems"],
        'Python': ["Course: Python for Data Science (Udemy)", "Project: Build a Python Portfolio"],
        'C': ["Course: C Programming for Beginners (Udemy)", "YouTube Playlist: C Programming Tutorial"]
    }
    student_data = df.iloc[student_index]
    recommendations = []
    weak_subjects = student_data[score_columns][student_data[score_columns] < threshold].index.tolist()
    for subject in weak_subjects:
        if subject in SUBJECT_RESOURCES:
            recommendations.append(f"Improve {subject}: {', '.join(SUBJECT_RESOURCES[subject])}")
    return recommendations

def generate_cluster_recommendations(student_index, df):
    CLUSTER_ADVICE = {
        0: "Focus on core programming (C/Python) and database skills.",
        1: "Strengthen math fundamentals (Analyse, Probabilité).",
        2: "Improve attendance and project grades."
    }
    cluster = df['cluster'][student_index]
    return CLUSTER_ADVICE.get(cluster, "General study plan: Balance all subjects.")

for i in range(len(df)):
    print(f"\n📝 Student {i} Report:")
    if df['risk_score'][i] == 'High Risk':
        print("🔴 HIGH RISK: Immediate action required!")
    print("🎯 Recommendations:")
    for rec in generate_recommendations(i, df):
        print(f"- {rec}")
    print(f"📊 Cluster Advice: {generate_cluster_recommendations(i, df)}")