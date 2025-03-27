from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import numpy as np
import pandas as pd
from django.db.models import Avg, Count
from .models import Matiere, Note, Utilisateur
import joblib
import os
from django.conf import settings
import logging

logger = logging.getLogger(__name__)
MODELS_DIR = os.path.join(settings.BASE_DIR, 'ml_models')
os.makedirs(MODELS_DIR, exist_ok=True)



def prepare_student_data(class_id=None):
    """
    Version finale avec diagnostic complet des données
    """
    try:
        logger.info(f"Préparation des données pour la classe {class_id}")
        
        # 1. Vérification initiale de la base de données
        total_students = Utilisateur.objects.filter(user_type='student').count()
        total_notes = Note.objects.count()
        logger.info(f"Étudiants totaux: {total_students}, Notes totales: {total_notes}")

        if total_notes == 0:
            logger.error("AUCUNE NOTE TROUVÉE dans la base de données!")
            return pd.DataFrame()

        # 2. Récupération optimisée des données
        query = Utilisateur.objects.filter(
            user_type='student',
            note__isnull=False  # Seulement les étudiants avec des notes
        ).annotate(
            note_count=Count('note')
        ).prefetch_related('note_set', 'classe')

        if class_id:
            query = query.filter(classe_id=class_id)

        students = list(query)
        logger.info(f"Étudiants avec notes trouvés: {len(students)}")

        if not students:
            logger.warning("Aucun étudiant avec notes trouvé")
            return pd.DataFrame()

        # 3. Préparation des données avec vérification complète
        data = []
        for student in students:
            notes = student.note_set.all()
            
            # Debug: Afficher les premières notes pour vérification
            if len(data) < 2:  # Affiche seulement pour les 2 premiers étudiants
                logger.debug(f"Notes pour étudiant {student.id}:")
                for note in notes[:3]:
                    logger.debug(f"  - Note ID:{note.id} Module:{note.note_module} Projet:{note.note_devoir_projet}")

            averages = notes.aggregate(
                avg_note=Avg('note_module'),
                avg_project=Avg('note_devoir_projet'),
                avg_attendance=Avg('presence'),
                avg_assiduite=Avg('assiduite')
            )

            # Conversion des moyennes avec vérification rigoureuse
            avg_note = float(averages['avg_note']) if averages['avg_note'] is not None else 0.0
            avg_project = float(averages['avg_project']) if averages['avg_project'] is not None else 0.0
            avg_attendance = float(averages['avg_attendance']) if averages['avg_attendance'] is not None else 0.0
            avg_assiduite = float(averages['avg_assiduite']) if averages['avg_assiduite'] is not None else 0.0

            data.append({
                'student_id': student.id,
                'features': [avg_note, avg_project, avg_attendance, avg_assiduite],
                'info': {
                    'first_name': student.first_name,
                    'last_name': student.last_name,
                    'class_id': student.classe.id if student.classe else None,
                    'class_name': student.classe.nom if student.classe else None
                }
            })

        logger.info(f"Données préparées pour {len(data)} étudiants")
        return pd.DataFrame(data)

    except Exception as e:
        logger.error(f"ERREUR CRITIQUE dans prepare_student_data: {str(e)}", exc_info=True)
        return pd.DataFrame()
    
def train_global_classification_model(retrain=True):
    """
    Entraîne ou charge un modèle de classification avec vérification améliorée
    """
    model_path = os.path.join(MODELS_DIR, 'global_classifier.pkl')
    
    try:
        if not retrain and os.path.exists(model_path):
            logger.info("Chargement du modèle existant")
            saved_data = joblib.load(model_path)
            return saved_data['model'], saved_data['scaler']
        
        logger.info("Entraînement d'un nouveau modèle")
        df = prepare_student_data()
        
        if df.empty:
            logger.error("DataFrame vide - aucune donnée disponible pour l'entraînement")
            raise ValueError("Pas assez de données pour l'entraînement")
        
        logger.info(f"Nombre d'étudiants pour l'entraînement: {len(df)}")
        logger.debug(f"Exemple de données:\n{df.head()}")
        
        # Définition des catégories
        df['category'] = pd.cut(
            df['features'].apply(lambda x: x[0]),
            bins=[0, 12, 14, 20],
            labels=['À risque', 'Moyenne performance', 'Bon performeur'],
            right=False
        )
        
        X = np.array(df['features'].tolist())
        y = df['category'].values
        
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        model = RandomForestClassifier(
            n_estimators=150,
            max_depth=5,
            random_state=42,
            class_weight='balanced'
        )
        model.fit(X_scaled, y)
        
        joblib.dump({
            'model': model,
            'scaler': scaler,
            'features': df['features'].tolist(),
            'categories': df['category'].tolist()
        }, model_path)
        
        logger.info("Modèle entraîné et sauvegardé avec succès")
        return model, scaler
        
    except Exception as e:
        logger.error(f"Erreur dans train_global_classification_model: {str(e)}", exc_info=True)
        raise
def classify_students(class_id):
    # Retrieve students in the class
    students = Utilisateur.objects.filter(classe_id=class_id, user_type='student')
    
    classification = []
    for student in students:
        # Calculate average score
        notes = Note.objects.filter(etudiant=student)
        if not notes:
            continue  
        
        average_score = sum(note.note_module * 0.7 + note.note_devoir_projet * 0.3 for note in notes) / len(notes)
        
        # Determine performance category
        if average_score >= 16:
            performance_category = 'Bon performeur'
        elif 12 <= average_score < 16:
            performance_category = 'Moyenne performance'
        else:
            performance_category = 'À risque'
        
        classification.append({
            'student_id': student.id,
            'student_name': student.username,
            'average_score': average_score,
            'performance_category': performance_category,
           
            'class_id': class_id,
            'class_name': student.classe.nom if student.classe else None
        })
    
    # Sort by average score
    classification.sort(key=lambda x: x['average_score'], reverse=True)
    
    return classification

def generate_risk_alerts(class_id=None):
    try:
        classified_students = classify_students(class_id)
        
        alerts = []
        for s in classified_students:
            # Ensure performance_category is set for all students
            performance_category = s.get('performance_category', 'Moyenne performance')
            
            if performance_category == 'À risque':
                alerts.append({
                    'student_id': s['student_id'],
                    'student_name': s['student_name'],
                    'performance_category': performance_category,  # Explicitly set this
                    'class_id': s['class_id'],
                    'class_name': s['class_name'],
                    'average_score': s['average_score'],
                    'alert_message': f"Étudiant à risque (moyenne: {s['average_score']:.2f})",
                    'recommendations': [
                        "Séances de tutorat obligatoires",
                        "Rencontre avec le conseiller pédagogique",
                        "Plan d'étude personnalisé recommandé"
                    ]
                })
        
        return alerts
        
    except Exception as e:
        logger.error(f"Erreur dans generate_risk_alerts: {str(e)}", exc_info=True)
        return []

def generate_recommendations_for_class(class_id):
    """
    Génère des recommandations avec un meilleur logging
    """
    try:
        logger.info(f"Génération de recommandations pour la classe {class_id}")
        classified_students = classify_students(class_id)
        recommendations = []
        
        for student in classified_students:
            rec = {
                'student_id': student['student_id'],
                'student_name': student['student_name'],
                'class_id': student['class_id'],
                'class_name': student['class_name'],
                'performance_category': student['performance_category'],
                'recommendations': []
            }
            
            # Recommandations basées sur la performance
            if student['performance_category'] == 'À risque':
                rec['recommendations'].extend([
                    {"message": "Tutorat intensif 3 fois/semaine"},
                    {"message": "Parcours de remise à niveau"}
                ])
            elif student['performance_category'] == 'Moyenne performance':
                rec['recommendations'].extend([
                    {"message": "Tutorat optionnel 1 fois/semaine"},
                    {"message": "Parcours standard"}
                ])
            else:
                rec['recommendations'].extend([
                    {"message": "Parcours d'excellence"},
                    {"message": "Projet personnel encadré"},
       
                ])
            
            # Recommandations par matière faible
            weak_subjects = Note.objects.filter(
                etudiant_id=student['student_id'],
                note_module__lt=10
            ).values_list('matiere__nom', flat=True).distinct()
            
            for subject in weak_subjects:
                rec['recommendations'].append({
                    "message": f"Soutien spécifique en {subject}"
                })
            
            recommendations.append(rec)
        
        logger.info(f"Recommandations générées pour {len(recommendations)} étudiants")
        return recommendations
        
    except Exception as e:
        logger.error(f"Erreur dans generate_recommendations_for_class: {str(e)}", exc_info=True)
        return []
    
def predict_s3_s4_grades(class_id=None):
    """
    Calcule les moyennes S1/S2 existantes et prédit seulement S3/S4
    """
    try:
        # 1. Récupération des étudiants (distincts)
        students_query = Utilisateur.objects.filter(
            user_type='student',
            note__isnull=False
        ).distinct()

        if class_id:
            students_query = students_query.filter(classe_id=class_id)

        students = list(students_query.prefetch_related('note_set', 'classe'))

        # 2. Récupération des matières S3/S4
        class_id = students[0].classe.id if students and students[0].classe else None
        matieres_s3_s4 = Matiere.objects.filter(
            semestre__in=[3, 4],
            classe_id=class_id
        ).distinct()

        # 3. Calculs et prédictions
        results = []
        for student in students:
            notes = student.note_set.all()
            
            # CALCUL DES MOYENNES RÉELLES S1/S2 (pas de prédiction ici)
            def calculate_semester_avg(notes_list):
                if not notes_list: return 0
                total = sum(
                    n.note_module * 0.5 +  # Poids module
                    n.note_devoir_projet * 0.3 +  # Poids projet
                    (n.presence / 20) * 2 +  # Poids présence
                    n.assiduite * 0.1  # Poids assiduité
                    for n in notes_list
                )
                return total / len(notes_list)

            # Notes S1 existantes (calcul)
            s1_notes = [n for n in notes if n.matiere.semestre == 1]
            s1_avg = calculate_semester_avg(s1_notes) if s1_notes else 0
            
            # Notes S2 existantes (calcul)
            s2_notes = [n for n in notes if n.matiere.semestre == 2]
            s2_avg = calculate_semester_avg(s2_notes) if s2_notes else 0

            # PRÉDICTION S3/S4 seulement
            matieres_pred = {}
            for matiere in matieres_s3_s4:
                # Formule de prédiction basée sur S1/S2
                if matiere.semestre == 3:  # S3
                    base_pred = s2_avg * 0.7 + s1_avg * 0.3
                else:  # S4
                    base_pred = s2_avg * 0.6 + s1_avg * 0.2 + (s2_avg - s1_avg) * 0.2
                
                # Ajustement aléatoire léger
                adjustment = np.random.uniform(-0.5, 0.5)
                predicted_note = max(0, min(20, base_pred + adjustment))

                matieres_pred[f'mat_{matiere.id}'] = {
                    'note': round(predicted_note, 2),
                    'matiere_nom': matiere.nom,
                    'semestre': matiere.semestre,
                    'coef': matiere.coefficient
                }

            results.append({
                'student_id': student.id,
                'student_name': f"{student.first_name} {student.last_name}",
                's1_avg': round(s1_avg, 2) if s1_notes else 'N/A',  # Moyenne CALCULÉE
                's2_avg': round(s2_avg, 2) if s2_notes else 'N/A',  # Moyenne CALCULÉE
                **matieres_pred  # Notes PRÉDITES seulement pour S3/S4
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
            'class_name': students[0].classe.nom if students and students[0].classe else ''
        }

    except Exception as e:
        logger.error(f"Erreur dans predict_s3_s4_grades: {str(e)}", exc_info=True)
        return {'error': str(e)}