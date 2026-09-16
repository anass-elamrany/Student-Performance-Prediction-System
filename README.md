# Student Performance Prediction System

Student Performance Prediction System is a digital university portal for academic monitoring, grade management, and AI-assisted student performance prediction.

The platform gives administrators, teachers, and students a shared space to manage academic data, follow progress, detect at-risk students early, and generate useful recommendations.

## Main Features

- Admin dashboard for university-wide academic overview
- Teacher dashboard for class and subject monitoring
- Student dashboard for personal grades, progress, and recommendations
- Student, teacher, class, subject, and grade management
- CSV import for students, teachers, subjects, and grades
- AI-based grade prediction and performance classification
- Alerts for students who may need academic support
- Personalized academic recommendations
- Role-based access control for admin, teacher, and student users

## Screenshots

Screenshots are available in the `screenshots/` folder.

```text
screenshots/
├── admin_dashboard.png
├── teacher_view.png
├── student_view.png
├── prediction_flow.png
└── ml_result.png
```

## Project Structure

```text
Student-Performance-Prediction-System/
├── backend/       Django REST API, database models, permissions, and ML logic
├── frontend/      React and Vite user interface
├── ml_research/   Jupyter notebooks used during model research
├── screenshots/   Application screenshots
└── docker-compose.yml
```

## Tech Stack

**Frontend**

- React
- Vite
- Material UI
- Recharts
- ApexCharts

**Backend**

- Django
- Django REST Framework
- Simple JWT
- SQLite

**Machine Learning**

- Scikit-learn
- Pandas
- NumPy
- Trained classification and regression models

## Run With Docker

From the project root:

```bash
docker-compose up --build
```

Open the application:

```text
http://localhost:3000
```

Backend API:

```text
http://localhost:8000/api
```

## Run Manually

Use two terminals.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend URL:

```text
http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Demo Accounts

```text
Teacher
Email: prof@school.com
Password: prof123
```

```text
Student
Email: student.uci.1@school.com
Password: student123
```

To reset the admin password:

```bash
cd backend
python manage.py changepassword admin
```

## Demo Data

The project includes a sample dataset:

```text
backend/raw_data/student-mat.csv
```

Load demo data:

```bash
cd backend
python manage.py seed_db
```

## API Overview

Main API groups:

```text
/api/login/
/api/dashboard/admin/
/api/dashboard/teacher/
/api/dashboard/student/
/api/students/
/api/classes/
/api/enseignants/
/api/matieres/
/api/admin/notes/
/api/teacher/notes/
/api/student/dashboard/
/api/ml/classify-class/
/api/predict-grades/
```

## Machine Learning

The ML layer uses trained models stored in:

```text
backend/models/
├── model_classification.pkl
└── model_regression.pkl
```

The models support:

- final grade prediction
- performance classification
- risk detection
- recommendation generation

## Portfolio Notes

This project demonstrates:

- full-stack application development
- role-based academic portal design
- REST API development
- frontend dashboard design
- machine learning integration
- CSV data import workflows
- Docker-based deployment setup

## Future Improvements

- Add more backend tests
- Add frontend component tests
- Improve CSV validation and error reporting
- Replace simulated dashboard data with real historical analytics
- Add password reset and email verification
- Add API documentation with Swagger or Redoc
