from django.apps import AppConfig
import joblib
import os
from django.conf import settings

import logging

logger = logging.getLogger(__name__)

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'data'
    
    # Stockage global pour les modèles ML
    model_classif = None
    model_reg = None

    def ready(self):
        # Évite le double chargement en mode debug
        if os.environ.get('RUN_MAIN', None) != 'true':
            return
            
        logger.info("Initialisation du moteur IA...")
        try:
            # On cherche le dossier 'models' dans le dossier backend (BASE_DIR)
            models_dir = os.path.join(settings.BASE_DIR, 'models')
            
            cls_path = os.path.join(models_dir, 'model_classification.pkl')
            reg_path = os.path.join(models_dir, 'model_regression.pkl')

            if os.path.exists(cls_path) and os.path.exists(reg_path):
                self.model_classif = joblib.load(cls_path)
                self.model_reg = joblib.load(reg_path)
                logger.info(f"Modeles charges depuis {models_dir}")
            else:
                logger.warning(f"Modeles introuvables dans {models_dir}")
        except Exception as e:
            logger.error(f"Erreur chargement IA: {e}")