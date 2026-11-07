# ModelForge

A beginner-friendly machine learning experimentation platform that helps users explore datasets, prepare data, train machine learning models, evaluate performance, and track experiments — all in one place.

## Technology Stack

- **Frontend:** Next.js (App Router), JavaScript, Tailwind CSS, Recharts
- **Backend:** Python, FastAPI
- **Data Processing:** Pandas, NumPy
- **Machine Learning:** scikit-learn
- **Database:** MongoDB
- **Dataset Storage:** Cloudflare R2
- **Authentication:** Clerk
- **Testing:** Pytest

## Project Structure

```text
model-forge/
├── frontend/    # Next.js application
└── backend/     # FastAPI services and ML pipeline
```

## Features Implemented

### Phase 1: Dataset Inspector Backend

- CSV file validation and upload
- Dataset structure and data-quality analysis
- Missing-value and duplicate-row detection
- Column types and unique-value analysis
- Numerical summary statistics
- Dataset warnings and automated tests

### Phase 2: Dataset Inspector Frontend

- Interactive dataset dashboard
- Dataset overview cards
- Column overview table
- Missing-value and column-type charts
- Numerical and categorical feature distributions
- Numerical summary statistics
- Data-quality warnings

### Phase 3: Baseline ML Training

- Train baseline classification and regression models
- Logistic Regression for classification
- Linear Regression for regression
- Numerical and categorical feature preprocessing
- Missing-value imputation
- Numerical feature scaling
- Categorical feature encoding
- Configurable train-test split
- Classification metrics: Accuracy, Precision, Recall, and F1-score
- Regression metrics: MAE, RMSE, and R²
- Frontend training form and evaluation-results dashboard
- Backend API tests

### Phase 3.5: Persistent Dataset Management

- Persistent dataset metadata using MongoDB
- Private dataset file storage using Cloudflare R2
- Upload and manage saved datasets
- Retrieve previously uploaded datasets
- User-specific dataset ownership

### Phase 4: Experiment Tracking & Model Comparison

- Automatically save successful training experiments
- Persistent experiment history
- View detailed experiment results
- Delete individual experiments
- Compare multiple training experiments
- Model performance comparison charts
- Metric-based model comparison
- Identify the best-performing model
- Filter and sort experiments
- Track model performance improvements against a baseline
- User-specific experiment ownership

### Phase 4.5: Public Landing Page & Entry Experience

- Public ModelForge landing page
- Product overview and feature showcase
- Responsive navigation and layout
- Product preview and workflow sections
- Sign-in and sign-up integration using Clerk
- Protected dashboard access
- Redirect authenticated users to the dashboard

## Development Status

| Phase | Description | Status |
|---|---|---|
| 1 | Dataset Inspector Backend | Complete |
| 2 | Dataset Inspector Frontend | Complete |
| 3 | Baseline ML Training | Complete |
| 3.5 | Persistent Dataset Management | Complete |
| 4 | Experiment Tracking & Model Comparison | Complete |
| 4.5 | Public Landing Page & Entry Experience | Complete |
| 5 | Data Preprocessing & Feature Engineering | Upcoming |
| 6 | Hyperparameter Optimization | Planned |
| 7 | Advanced Model Evaluation & Interpretation | Planned |
| 8 | Model Export & Prediction | Planned |
| 9 | Product Polish & Deployment | Planned |

## Running Locally

### Backend

```bash
cd backend

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

The backend API runs at:

`http://127.0.0.1:8000`

### Frontend

Open a separate terminal:

```bash
cd frontend

npm install
npm run dev
```

Open the application at:

`http://localhost:3000`

**Note:** Configure the required environment variables for Clerk, MongoDB, Cloudflare R2, and the frontend API URL before running the complete application. Never commit environment files containing secrets.

## Roadmap

### Phase 5: Data Preprocessing & Feature Engineering

- Missing-value handling strategies
- Duplicate removal
- Categorical encoding options
- Feature scaling
- Outlier handling
- Feature selection

### Phase 6: Hyperparameter Optimization

- Grid Search
- Randomized Search
- Model parameter tuning
- Compare tuned models with baseline experiments

### Phase 7: Advanced Model Evaluation & Interpretation

- Advanced evaluation metrics
- Confusion matrix and ROC curves
- Feature importance
- Model interpretation and explainability

### Phase 8: Model Export & Prediction

- Export trained models
- Make predictions using saved models
- Support prediction on new datasets

### Phase 9: Product Polish & Deployment

- Improve user experience
- Responsive design improvements
- Production deployment
- Performance and reliability improvements

## Project Vision

ModelForge aims to make machine learning experimentation more accessible to beginners by providing an organized workspace to explore datasets, prepare features, train models, evaluate results, and compare experiments without having to build the entire workflow from scratch.
