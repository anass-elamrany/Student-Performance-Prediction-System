from sklearn.ensemble import RandomForestClassifier
import numpy as np
import pandas as pd
from .models import Matiere, Note, Utilisateur
import joblib
import os
from django.conf import settings
import logging
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score

logger = logging.getLogger(__name__)
MODELS_DIR = os.path.join(settings.BASE_DIR, 'ml_models')
os.makedirs(MODELS_DIR, exist_ok=True)


MATIERE_RECOMMENDATIONS = {
    "java": {
        "noms": ["Java complet pour débutants", "Java Masterclass Udemy"],
        "liens": [
            "https://www.youtube.com/watch?v=LnX3B9oaKzw",
            "https://www.udemy.com/course/java-the-complete-java-developer-course/"
        ]
    },
    "python": {
        "noms": ["Python en une vidéo", "Complete Python Bootcamp"],
        "liens": [
            "https://www.youtube.com/watch?v=HGOBQPFzWKo",
            "https://www.udemy.com/course/complete-python-bootcamp/"
        ]
    },
    "prosto": {
        "noms": ["Introduction aux probabilités", "Probability & Statistics Udemy"],
        "liens": [
            "https://www.youtube.com/watch?v=KDfWgyRnSmA",
            "https://www.udemy.com/course/probability-and-statistics-for-business-and-data-science/"
        ]
    },
    "filatt": {
        "noms": ["Files d'attente", "Operations Research Udemy"],
        "liens": [
            "https://www.youtube.com/watch?v=8W6aFqkiJvE",
            "https://www.udemy.com/course/operations-research/"
        ]
    },
    "calcoumar": {
        "noms": ["Calcul différentiel", "Mastering Calculus"],
        "liens": [
            "https://www.youtube.com/watch?v=3Xl5jVsZ9Wk",
            "https://www.udemy.com/course/mastering-calculus/"
        ]
    },
    "gessto": {
        "noms": ["Gestion des stocks", "Inventory Management"],
        "liens": [
            "https://www.youtube.com/watch?v=J4Wv9F9E3gY",
            "https://www.udemy.com/course/inventory-management/"
        ]
    },
    "gespro": {
        "noms": ["Gestion de projet", "PMP Exam Prep"],
        "liens": [
            "https://www.youtube.com/watch?v=4ePjDwMFZRI",
            "https://www.udemy.com/course/pmp-exam-prep-course/"
        ]
    },
    "infges": {
        "noms": ["Systèmes d'information", "Management Information Systems"],
        "liens": [
            "https://www.youtube.com/watch?v=2n5g4jXg4T4",
            "https://www.udemy.com/course/management-information-systems/"
        ]
    },
    "ent": {
        "noms": ["Entrepreneuriat", "Complete Entrepreneurship Course"],
        "liens": [
            "https://www.youtube.com/watch?v=F4ZGfUAP4XU",
            "https://www.udemy.com/course/entrepreneurship-course/"
        ]
    },
    "devweb": {
        "noms": ["Développement web débutants", "Web Developer Bootcamp"],
        "liens": [
            "https://www.youtube.com/watch?v=nu_pCVPKzTk",
            "https://www.udemy.com/course/the-web-developer-bootcamp/"
        ]
    },
    "bd": {
        "noms": ["Bases de données", "SQL & MySQL for BI"],
        "liens": [
            "https://www.youtube.com/watch?v=HXV3zeQKqGY",
            "https://www.udemy.com/course/sql-mysql-for-data-analytics-and-business-intelligence/"
        ]
    },
    "gesfin": {
        "noms": ["Gestion financière", "Financial Analyst Course"],
        "liens": [
            "https://www.youtube.com/watch?v=7dJkI6vRz6k",
            "https://www.udemy.com/course/the-complete-financial-analyst-course/"
        ]
    },
    "eman": {
        "noms": ["e-Management", "Digital Leadership"],
        "liens": [
            "https://www.youtube.com/watch?v=5AqgMo1P4zI",
            "https://www.udemy.com/course/digital-leadership/"
        ]
    },
    "gestbudg": {
        "noms": ["Gestion budgétaire", "Budgeting in Excel"],
        "liens": [
            "https://www.youtube.com/watch?v=3m6dV7Xo3Vc",
            "https://www.udemy.com/course/budgeting-and-forecasting-in-excel/"
        ]
    },
    "default": {
        "noms": ["Ressource générale d'apprentissage"],
        "liens": ["https://www.coursera.org"]
    }
}


ORIENTATIONS = [
    {
        "orientation": "Développement Web",
        "mots_cles": ["java", "python", "devweb", "bd"],
        "description": "Orientation vers les technologies web et le développement d'applications"
    },
    {
        "orientation": "Data Science",
        "mots_cles": ["python", "prosto", "bd", "calcoumar"],
        "description": "Orientation vers l'analyse de données et l'intelligence artificielle"
    },
    {
        "orientation": "Cybersécurité",
        "mots_cles": ["infges", "bd", "python"],
        "description": "Orientation vers la sécurité informatique et la protection des données"
    },
    {
        "orientation": "Gestion de Projets IT",
        "mots_cles": ["gespro", "infges", "ent"],
        "description": "Orientation vers la gestion de projets technologiques"
    },
    {
        "orientation": "Systèmes d'Information",
        "mots_cles": ["infges", "gesfin", "gestbudg"],
        "description": "Orientation vers la gestion des systèmes d'information d'entreprise"
    },
    {
        "orientation": "Intelligence Artificielle",
        "mots_cles": ["python", "prosto", "calcoumar"],
        "description": "Orientation vers le machine learning et l'IA"
    },
    {
        "orientation": "Cloud Computing",
        "mots_cles": ["devweb", "bd", "python"],
        "description": "Orientation vers les technologies cloud et DevOps"
    }
]

def calculate_subject_grade(note, total_seances=20):
    """Calcule la note d'une matière avec normalisation stricte 0-20"""

    note_module = max(0, min(20, note.note_module or 0))
    note_devoir = max(0, min(20, note.note_devoir_projet or 0))
    assiduite = max(0, min(20, note.assiduite or 0))
    

    absences = max(0, min(total_seances, note.presence or 0))
    taux_presence = (total_seances - absences) / total_seances
    

    return (
        (note_module * 0.5) +
        (note_devoir * 0.3) +
        (taux_presence * 0.1) +
        (assiduite * 0.1)
    )

def calculate_semester_avg(notes_list, total_seances=20):
    """Calcule la moyenne d'un semestre"""
    if not notes_list:
        return None
    

    matieres = {}
    for note in notes_list:
        matiere_id = note.matiere.id
        if matiere_id not in matieres:
            matieres[matiere_id] = []
        matieres[matiere_id].append(note)
    
 
    moyennes = []
    for notes_matiere in matieres.values():
        moy_matiere = sum(calculate_subject_grade(n, total_seances) for n in notes_matiere) / len(notes_matiere)
        moyennes.append(moy_matiere)
    
    return sum(moyennes) / len(moyennes) if moyennes else None

def get_subject_recommendations(matiere_nom):
    """Retourne les recommandations pour une matière spécifique"""
    try:
        if not matiere_nom or not isinstance(matiere_nom, str):
            return MATIERE_RECOMMENDATIONS["default"]
        
        matiere_key = matiere_nom.lower().replace(" ", "")
        

        if matiere_key in MATIERE_RECOMMENDATIONS:
            return MATIERE_RECOMMENDATIONS[matiere_key]
        

        for key in MATIERE_RECOMMENDATIONS:
            if key in matiere_key or matiere_key in key:
                return MATIERE_RECOMMENDATIONS[key]
        
        return MATIERE_RECOMMENDATIONS["default"]
    except Exception as e:
        logger.error(f"Error in get_subject_recommendations: {str(e)}")
        return MATIERE_RECOMMENDATIONS["default"]

def get_academic_orientation(student_notes):
    """Détermine l'orientation académique basée sur les notes"""
    try:
        if not student_notes:
            return None
        
        student_profile = {}
        for note in student_notes:
            matiere_name = note.matiere.nom.lower().replace(" ", "")
            student_profile[matiere_name] = calculate_subject_grade(note)
        
        orientation_scores = []
        for orientation in ORIENTATIONS:
            score = 0
            matched = 0
            for subject in orientation["mots_cles"]:
                if subject in student_profile:
                    score += student_profile[subject]
                    matched += 1
            if matched > 0:
                orientation_scores.append({
                    "orientation": orientation["orientation"],
                    "score": score / matched,
                    "description": orientation["description"]
                })
        
        if orientation_scores:
            return max(orientation_scores, key=lambda x: x["score"])
        return None
    except Exception as e:
        logger.error(f"Error in get_academic_orientation: {str(e)}")
        return None

def prepare_student_data(class_id=None):
    """Prépare les données des étudiants"""
    try:
        students = Utilisateur.objects.filter(
            user_type='student',
            note__isnull=False
        )
        
        if class_id:
            students = students.filter(classe_id=class_id)

        data = []
        for student in students.prefetch_related('note_set'):
            notes = list(student.note_set.all())
            if not notes:
                continue

      
            total = sum(calculate_subject_grade(n) for n in notes)
            avg_grade = total / len(notes)

            data.append({
                'student_id': student.id,
                'features': [avg_grade],
                'info': {
                    'first_name': student.first_name,
                    'last_name': student.last_name,
                    'class_id': student.classe.id if student.classe else None,
                    'class_name': student.classe.nom if student.classe else None
                }
            })

        return pd.DataFrame(data)
    except Exception as e:
        logger.error(f"Error in prepare_student_data: {str(e)}", exc_info=True)
        return pd.DataFrame()

def classify_students(class_id):
    """Classifie les étudiants par performance"""
    students = Utilisateur.objects.filter(classe_id=class_id, user_type='student')
    classification = []
    
    for student in students:
        notes = list(Note.objects.filter(etudiant=student))
        if not notes:
            continue
        
  
        avg_score = sum(calculate_subject_grade(n) for n in notes) / len(notes)
        
        if avg_score >= 16:
            category = 'Bon performeur'
        elif 12 <= avg_score < 16:
            category = 'Moyenne performance'
        else:
            category = 'À risque'
        
        classification.append({
            'student_id': student.id,
            'student_name': f"{student.first_name} {student.last_name}",
            'average_score': round(avg_score, 2),
            'performance_category': category,
            'class_id': class_id,
            'class_name': student.classe.nom if student.classe else None
        })
    
    return sorted(classification, key=lambda x: x['average_score'], reverse=True)

def generate_risk_alerts(class_id=None):
    """Génère des alertes pour les étudiants à risque"""
    try:
        classified = classify_students(class_id)
        alerts = []
        
        for student in classified:
            if student['performance_category'] == 'À risque':
                weak_subjects = Note.objects.filter(
                    etudiant_id=student['student_id'],
                    note_module__lt=10
                ).select_related('matiere')
                
                courses = []
                for note in weak_subjects:
                    matiere = note.matiere
                    rec = get_subject_recommendations(matiere.nom)
                    courses.append({
                        'subject': matiere.nom,
                        'resources': [
                            {'name': name, 'link': link} 
                            for name, link in zip(rec['noms'], rec['liens'])
                        ]
                    })
                
                alerts.append({
                    'student_id': student['student_id'],
                    'student_name': student['student_name'],
                    'average_score': student['average_score'],
                    'performance_category': student['performance_category'],
                    'course_recommendations': courses
                })
        
        return alerts
    except Exception as e:
        logger.error(f"Error in generate_risk_alerts: {str(e)}", exc_info=True)
        return []

def generate_recommendations_for_class(class_id):
    """Génère des recommandations complètes pour une classe"""
    try:
        classified = classify_students(class_id)
        recommendations = []
        
        for student in classified:
            notes = list(Note.objects.filter(etudiant_id=student['student_id']))
            orientation = get_academic_orientation(notes)
            
            rec = {
                'student_id': student['student_id'],
                'student_name': student['student_name'],
                'performance_category': student['performance_category'],
                'recommendations': [],
                'academic_orientation': orientation
            }
            
       
            if student['performance_category'] == 'À risque':
                rec['recommendations'].extend([
                    {"type": "performance", "message": "Tutorat intensif", "priority": "high"},
                    {"type": "performance", "message": "Parcours de remise à niveau", "priority": "high"}
                ])
            elif student['performance_category'] == 'Moyenne performance':
                rec['recommendations'].extend([
                    {"type": "performance", "message": "Tutorat optionnel", "priority": "medium"},
                    {"type": "performance", "message": "Parcours standard", "priority": "medium"}
                ])
            else:
                rec['recommendations'].extend([
                    {"type": "performance", "message": "Parcours d'excellence", "priority": "low"},
                    {"type": "performance", "message": "Projet personnel", "priority": "low"}
                ])
            
     
            if orientation:
                rec['recommendations'].append({
                    "type": "orientation",
                    "message": f"Orientation: {orientation['orientation']}",
                    "details": orientation['description'],
                    "priority": "medium"
                })
            
 
            weak_subjects = Note.objects.filter(
                etudiant_id=student['student_id'],
                note_module__lt=10
            ).select_related('matiere')
            
            for note in weak_subjects:
                matiere = note.matiere
                recs = get_subject_recommendations(matiere.nom)
                
                rec['recommendations'].append({
                    "type": "subject",
                    "message": f"Soutien en {matiere.nom}",
                    "subject": matiere.nom,
                    "resources": [
                        {"name": name, "link": link} 
                        for name, link in zip(recs['noms'], recs['liens'])
                    ]
                })
            
            recommendations.append(rec)
        
        return recommendations
    except Exception as e:
        logger.error(f"Error in generate_recommendations_for_class: {str(e)}", exc_info=True)
        return []

def train_global_classification_model(retrain=True):
    """Entraîne ou charge le modèle de classification avec évaluation des métriques"""
    model_path = os.path.join(MODELS_DIR, 'global_classifier.pkl')
    metrics_path = os.path.join(MODELS_DIR, 'classification_metrics.txt')
    
    try:
        if not retrain and os.path.exists(model_path):
            return joblib.load(model_path)
        
        df = prepare_student_data()
        if df.empty:
            raise ValueError("Pas assez de données pour l'entraînement")
        

        X = np.array(df['features'].tolist())
        y = pd.cut(
            df['features'].apply(lambda x: x[0]),
            bins=[0, 12, 16, 20],
            labels=['À risque', 'Moyenne performance', 'Bon performeur']
        )
        
     
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
 
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        

        y_test_num = [12 if x == 'À risque' else 14 if x == 'Moyenne performance' else 18 for x in y_test]
        y_pred_num = [12 if x == 'À risque' else 14 if x == 'Moyenne performance' else 18 for x in y_pred]
        rmse = np.sqrt(mean_squared_error(y_test_num, y_pred_num))
        
       
        with open(metrics_path, 'w') as f:
            f.write(f"Random Forest Classifier Metrics:\n")
            f.write(f"Accuracy: {acc:.4f}\n")
            f.write(f"RMSE: {rmse:.4f}\n")
            f.write(f"Feature Importance: {model.feature_importances_}\n")
        
        logger.info(f"Model trained - Accuracy: {acc:.4f}, RMSE: {rmse:.4f}")
        
        joblib.dump(model, model_path)
        return model
    except Exception as e:
        logger.error(f"Error in train_global_classification_model: {str(e)}", exc_info=True)
        raise



def predict_s3_s4_grades(class_id=None):
    """Prédit les notes des semestres 3 et 4 en utilisant la régression linéaire"""
    try:
        students = Utilisateur.objects.filter(
            user_type='student',
            note__isnull=False,
            classe_id=class_id
        ).prefetch_related('note_set', 'classe')

        matieres_s3_s4 = Matiere.objects.filter(
            semestre__in=[3, 4],
            classe_id=class_id
        )

        
        X = []
        y_s3 = []
        y_s4 = []
        
     
        for student in students:
            notes = list(student.note_set.all())
            
            s1_avg = calculate_semester_avg([n for n in notes if n.matiere.semestre == 1])
            s2_avg = calculate_semester_avg([n for n in notes if n.matiere.semestre == 2])
            s3_avg = calculate_semester_avg([n for n in notes if n.matiere.semestre == 3])
            s4_avg = calculate_semester_avg([n for n in notes if n.matiere.semestre == 4])
            
            if None not in [s1_avg, s2_avg, s3_avg, s4_avg]:
                X.append([s1_avg, s2_avg])
                y_s3.append(s3_avg)
                y_s4.append(s4_avg)
        
        results = []
        
        if len(X) >= 5:  
            
            X_train, X_test, y_train, y_test = train_test_split(X, y_s3, test_size=0.2, random_state=42)
            model_s3 = LinearRegression()
            model_s3.fit(X_train, y_train)
            
           
            X_train, X_test, y_train, y_test = train_test_split(X, y_s4, test_size=0.2, random_state=42)
            model_s4 = LinearRegression()
            model_s4.fit(X_train, y_train)
            
        
            for student in students:
                notes = list(student.note_set.all())
                
                s1_avg = calculate_semester_avg([n for n in notes if n.matiere.semestre == 1])
                s2_avg = calculate_semester_avg([n for n in notes if n.matiere.semestre == 2])

               
                if s1_avg is None and s2_avg is None:
                    continue
                s1_avg = s1_avg if s1_avg is not None else s2_avg
                s2_avg = s2_avg if s2_avg is not None else s1_avg

               
                matieres_pred = {}
                for matiere in matieres_s3_s4:
                    input_features = [[s1_avg, s2_avg]]
                    
                    if matiere.semestre == 3:
                        predicted_note = model_s3.predict(input_features)[0]
                    else:
                        predicted_note = model_s4.predict(input_features)[0]
                    
                    
                    predicted_note = max(0, min(20, predicted_note))

                    matieres_pred[f'mat_{matiere.id}'] = {
                        'note': round(predicted_note, 2),
                        'matiere_nom': matiere.nom,
                        'semestre': matiere.semestre,
                        'coef': matiere.coefficient
                    }

                results.append({
                    'student_id': student.id,
                    'student_name': f"{student.first_name} {student.last_name}",
                    's1_avg': round(s1_avg, 2) if s1_avg is not None else 'N/A',
                    's2_avg': round(s2_avg, 2) if s2_avg is not None else 'N/A',
                    **matieres_pred
                })
        else:
            
            logger.warning("Pas assez de données historiques pour la régression linéaire. Utilisation de la méthode heuristique.")
            for student in students:
                notes = list(student.note_set.all())
                
                s1_avg = calculate_semester_avg([n for n in notes if n.matiere.semestre == 1])
                s2_avg = calculate_semester_avg([n for n in notes if n.matiere.semestre == 2])

                if s1_avg is None and s2_avg is None:
                    continue
                s1_avg = s1_avg if s1_avg is not None else s2_avg
                s2_avg = s2_avg if s2_avg is not None else s1_avg

                matieres_pred = {}
                for matiere in matieres_s3_s4:
                    if matiere.semestre == 3:
                        base_pred = s2_avg * 0.7 + s1_avg * 0.3
                    else:
                        base_pred = s2_avg * 0.6 + s1_avg * 0.2 + (s2_avg - s1_avg) * 0.2
                    
                    predicted_note = max(0, min(20, base_pred + np.random.uniform(-0.5, 0.5)))

                    matieres_pred[f'mat_{matiere.id}'] = {
                        'note': round(predicted_note, 2),
                        'matiere_nom': matiere.nom,
                        'semestre': matiere.semestre,
                        'coef': matiere.coefficient
                    }

                results.append({
                    'student_id': student.id,
                    'student_name': f"{student.first_name} {student.last_name}",
                    's1_avg': round(s1_avg, 2) if s1_avg is not None else 'N/A',
                    's2_avg': round(s2_avg, 2) if s2_avg is not None else 'N/A',
                    **matieres_pred
                })

        return {
            'students': results,
            'matieres': [{
                'id': m.id,
                'nom': m.nom,
                'semestre': m.semestre,
                'coef': m.coefficient,
                'field_name': f'mat_{m.id}'
            } for m in matieres_s3_s4],
            'class_name': students[0].classe.nom if students else '',
            'method_used': 'regression' if len(X) >= 5 else 'heuristic'
        }
    except Exception as e:
        logger.error(f"Error in predict_s3_s4_grades: {str(e)}", exc_info=True)
        return {'error': str(e)}