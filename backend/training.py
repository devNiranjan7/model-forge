import pandas as pd
from fastapi import HTTPException
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def train_baseline_model(
    df: pd.DataFrame,
    target_column: str,
    task_type: str,
    test_size: float = 0.2,
    random_state: int = 42,
) -> dict:
    if target_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{target_column}' does not exist.")
    if task_type not in {"classification", "regression"}:
        raise HTTPException(status_code=400, detail="Task type must be 'classification' or 'regression'.")
    if not 0.1 <= test_size <= 0.4:
        raise HTTPException(status_code=400, detail="Test size must be between 0.1 and 0.4.")
    if df.empty or len(df) < 10:
        raise HTTPException(status_code=400, detail="At least 10 rows are required for training.")

    data = df.dropna(subset=[target_column]).copy()
    if data[target_column].nunique() < 2:
        raise HTTPException(status_code=400, detail="The target must contain at least two distinct values.")

    if task_type == "regression":
        target = pd.to_numeric(data[target_column], errors="coerce")
        data = data.loc[target.notna()].copy()
        target = target.loc[target.notna()]
        if target.nunique() < 2:
            raise HTTPException(status_code=400, detail="Regression requires at least two distinct numeric target values.")
    else:
        target = data[target_column]
        if target.nunique() > 50:
            raise HTTPException(
                status_code=400,
                detail="Classification target has more than 50 classes. Choose a suitable target column.",
            )

    features = data.drop(columns=[target_column])
    features = features.dropna(axis=1, how="all")
    features = features.loc[:, features.nunique(dropna=True) > 1]
    if features.empty:
        raise HTTPException(status_code=400, detail="At least one usable feature column is required.")

    for column in features.columns:
        if features[column].dtype == "object":
            converted = pd.to_numeric(features[column], errors="coerce")
            if converted.notna().sum() == features[column].notna().sum():
                features[column] = converted

    numeric_features = features.select_dtypes(include="number").columns.tolist()
    categorical_features = features.select_dtypes(exclude="number").columns.tolist()
    transformers = []

    if numeric_features:
        transformers.append(
            (
                "numeric",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="median")),
                    ("scaler", StandardScaler()),
                ]),
                numeric_features,
            )
        )
    if categorical_features:
        transformers.append(
            (
                "categorical",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("encoder", OneHotEncoder(handle_unknown="ignore")),
                ]),
                categorical_features,
            )
        )

    preprocessor = ColumnTransformer(transformers=transformers)
    model = LogisticRegression(max_iter=1000) if task_type == "classification" else LinearRegression()
    pipeline = Pipeline([("preprocessor", preprocessor), ("model", model)])
    stratify = None
    if task_type == "classification":
        class_counts = target.value_counts()
        if class_counts.min() >= 2:
            stratify = target

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            features,
            target,
            test_size=test_size,
            random_state=random_state,
            stratify=stratify,
        )
        pipeline.fit(X_train, y_train)
        predictions = pipeline.predict(X_test)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Unable to train the model: {exc}") from exc

    if task_type == "classification":
        metrics = {
            "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
            "precision_weighted": round(float(precision_score(y_test, predictions, average="weighted", zero_division=0)), 4),
            "recall_weighted": round(float(recall_score(y_test, predictions, average="weighted", zero_division=0)), 4),
            "f1_weighted": round(float(f1_score(y_test, predictions, average="weighted", zero_division=0)), 4),
        }
    else:
        mse = mean_squared_error(y_test, predictions)
        metrics = {
            "mae": round(float(mean_absolute_error(y_test, predictions)), 4),
            "rmse": round(float(mse**0.5), 4),
            "r2": round(float(r2_score(y_test, predictions)), 4),
        }

    return {
        "task_type": task_type,
        "model": "Logistic Regression" if task_type == "classification" else "Linear Regression",
        "target_column": target_column,
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "feature_count": int(features.shape[1]),
        "metrics": metrics,
    }
