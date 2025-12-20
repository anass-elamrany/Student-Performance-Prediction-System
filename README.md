# 🎓 Système de Prédiction et Classification des Performances Étudiantes

![EST Oujda Logo](frontend/src/assets/images/logoEST.jpg)

> **Projet de Fin d'Études (PFE)**

> **École Supérieure de Technologie - Oujda**

> *Université Mohammed Premier*

> *Filière : Informatique Décisionnelle et Apprentissage Automatique*

---

## 📋 Présentation du Projet
Ce projet est une plateforme intelligente conçue pour révolutionner le suivi pédagogique. En combinant un tableau de bord interactif et des algorithmes de **Machine Learning**, l'application permet de prédire les performances des étudiants, de détecter les risques d'échec précocement et de fournir des recommandations personnalisées aux enseignants et aux étudiants.

### 🌟 Fonctionnalités Clés
- **🔮 Prédiction par IA** : Estimation des notes futures et classification des étudiants (Excellence, Moyen, À Risque) basée sur l'historique académique.
- **📊 Tableaux de Bord Intuitifs** :
  - **Admin** : Vue globale sur l'établissement, statistiques par classe/matière, gestion des utilisateurs.
  - **Enseignant** : Suivi des classes, détection des étudiants en difficulté, analyse comparative.
  - **Étudiant** : Suivi de progression, comparaison avec la moyenne de la classe, conseils personnalisés.
- **🚀 Performance & Sécurité** : Architecture moderne, authentification JWT, et chargement optimisé (Lazy Loading).

---

## 🛠️ Architecture Technique

### 🎨 Frontend (Interface Utilisateur)
- **Framework** : React 19 (Vite)
- **Design System** : Material UI (MUI)
- **Visualisation** : Recharts, ApexCharts
- **Gestionnaire de paquets** : NPM

### ⚙️ Backend (Serveur & IA)
- **Framework** : Django 5.1 (Django REST Framework)
- **Base de Données** : SQLite (Dev) / PostgreSQL (Prod)
- **Intelligence Artificielle** : Scikit-learn, Pandas, NumPy
- **Sécurité** : Authentication JWT, WhiteNoise

### 🐳 DevOps
- **Conteneurisation** : Docker & Docker Compose
- **Serveur Web** : Nginx (Frontend) + Gunicorn (Backend)

---

## 👥 Équipe de Réalisation
Ce projet a été réalisé avec passion par :
- **[Anass El Amrany](https://github.com/anass-elamrany)**
- **[Awitty Gentleman](https://github.com/awittygenlteman)**
- **[Maryame Dani](https://github.com/MaryameDani)** 

---

## 🚀 Installation et Démarrage

### Option 1 : Via Docker (Recommandé)
L'application est entièrement conteneurisée.
```bash
# Lancer tout le projet
docker-compose up --build
```
> Accès : 
> - Frontend : http://localhost:3000
> - Backend : http://localhost:8000

### Option 2 : Installation Manuelle

**Backend :**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend :**
```bash
cd frontend
npm install
npm run dev
```

---

## ⚖️ Licence et Droits d'Utilisation

**© 2025 - Tous droits réservés.**

Ce code source est la propriété intellectuelle de ses auteurs et de l'École Supérieure de Technologie d'Oujda. 
Il est publié ici à des fins de **démonstration et de portfolio**.

⚠️ **Restrictions :**
- Toute **utilisation commerciale** est strictement interdite.
- La **copie** ou la **redistribution** sans autorisation explicite est interdite.
- Vous pouvez consulter ce code pour l'apprentissage, mais veuillez ne pas le plagier pour votre propre PFE.

---


  Fait avec ❤️ à EST Oujda, Maroc.

