# Cognicare AI — Alzheimer's Disease Prediction System

Cognicare AI is a full-stack machine-learning application for Alzheimer's disease risk prediction. It combines a React/Vite interface with a FastAPI backend and an eight-model ensemble that uses SMOTE for class-imbalance handling.

## Features

- Patient intake and clinical data collection
- Custom dataset training
- Single-patient and batch prediction
- Eight ML models: ANN, XGBoost, Gradient Boosting, AdaBoost, SVM, Random Forest, Decision Tree, KNN, Naive Bayes, and Logistic Regression
- SMOTE-based imbalance correction
- Model metrics, confusion matrices, and model comparison
- Responsive dashboard for desktop and mobile

## Project structure

- `backend/` — FastAPI API and machine-learning engine
- `frontend/` — React/Vite application
- `app.js` — Root application entry point
- `index.html` and `styles.css` — Root web interface

## Run locally

### Backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.server:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend is available at `http://localhost:5173` and the backend at `http://localhost:8000`.

## Notes

The backend currently creates a synthetic dataset when no dataset is supplied. The ML engine supports custom CSV datasets through the API.
