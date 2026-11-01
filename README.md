# ModelForge

A beginner-friendly machine learning experimentation platform that helps users inspect datasets, train machine learning models, and evaluate their performance.

## Technology Stack

- **Frontend:** Next.js, JavaScript, Tailwind CSS, Recharts
- **Backend:** Python, FastAPI
- **Data Processing:** Pandas, NumPy
- **Machine Learning:** scikit-learn
- **Experiment Persistence:** MongoDB (planned)

## Project Structure

- `frontend/` — Next.js web application for dataset inspection and model training
- `backend/` — FastAPI services for CSV validation, dataset analysis, and machine learning

## Features Implemented

### Phase 1: Dataset Inspector Backend
- CSV file validation and upload
- Dataset structure and data-quality analysis
- Missing-value and duplicate-row detection
- Column types, unique values, and numerical statistics
- Dataset warnings and automated tests

### Phase 2: Dataset Inspector Frontend
- Interactive dataset dashboard
- Dataset overview cards
- Column overview table
- Missing-value and column-type charts
- Numeric and categorical feature distributions
- Numerical summary statistics and data-quality warnings

### Phase 3: Baseline ML Training
- Train baseline classification and regression models
- Logistic Regression for classification
- Linear Regression for regression
- Numerical and categorical feature preprocessing
- Missing-value imputation, scaling, and categorical encoding
- Configurable train-test split
- Classification metrics: accuracy, precision, recall, and F1-score
- Regression metrics: MAE, RMSE, and R²
- Frontend training form and evaluation-results dashboard
- Backend API tests

## Development Status

- **Phase 1:** Dataset Inspector Backend — Complete
- **Phase 2:** Dataset Inspector Frontend — Complete
- **Phase 3:** Baseline ML Training — Complete
- **Phase 4:** Experiment Tracking and Model Comparison — Planned
- **Phase 5:** Hyperparameter Optimization — Planned
- **Phase 6:** Model Interpretation — Planned
- **Phase 7:** Persistence, Export, and Deployment — Planned

## Running Locally

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Future Plans

- Persistent experiment history using MongoDB
- Compare multiple model training runs
- Hyperparameter tuning
- Model interpretation and feature importance
- Model export and deployment
