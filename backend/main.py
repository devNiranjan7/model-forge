import csv
import io

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


def validate_csv(filename: str, content: bytes):
    """Validates a csv file size and content."""
    if not filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File size must not exceed 10 MB")

    try:
        text = content.decode("utf-8-sig")
        reader = csv.reader(io.StringIO(text), strict=True)
        headers = next(reader, None)
        if not headers or all(not header.strip() for header in headers):
            raise HTTPException(
                status_code=400, detail="The CSV file must contain column headers."
            )

        if any(not header.strip() for header in headers):
            raise HTTPException(status_code=400, detail="Column names cannot be empty.")

        if len(headers) != len(set(headers)):
            raise HTTPException(
                status_code=400, detail="Duplicate column names are not allowed."
            )

        rows = list(reader)
        if not any(rows):
            raise HTTPException(
                status_code=400,
                detail="The CSV file must contain at least one data row.",
            )

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="The file must use UTF-8 text encoding.",
        ) from None

    except csv.Error:
        raise HTTPException(
            status_code=400,
            detail="The CSV file is malformed or unreadable.",
        ) from None


def create_histograms(numeric_df: pd.DataFrame) -> dict:
    """Create histogram bins for each column"""
    histograms = {}
    for column in numeric_df.columns:
        values = numeric_df[column].dropna()
        if values.empty:
            histograms[column] = []
            continue

        counts, bin_edges = np.histogram(values, bins=10)
        histograms[column] = [
            {
                "bin_start": float(bin_edges[i]),
                "bin_end": float(bin_edges[i + 1]),
                "count": int(counts[i]),
            }
            for i in range(len(counts))
        ]

    return histograms


def create_categorical_distributions(
    df: pd.DataFrame, columns: list[str], top_n: int = 10
) -> dict:
    """Return the most frequent values for each categorical column."""
    distributions = {}

    for column in columns:
        counts = df[column].dropna().astype(str).value_counts().head(top_n)
        distributions[column] = [
            {
                "category": str(category),
                "count": int(count),
            }
            for category, count in counts.items()
        ]

    return distributions


def train_baseline_model(
    df: pd.DataFrame,
    target_column: str,
    task_type: str,
    test_size: float = 0.2,
    random_state: int = 42,
) -> dict:
    """Train and evaluate a baseline classification or regression model."""

    if target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Target column '{target_column}' does not exist.",
        )

    if task_type not in {"classification", "regression"}:
        raise HTTPException(
            status_code=400,
            detail="Task type must be 'classification' or 'regression'.",
        )

    if not 0.1 <= test_size <= 0.4:
        raise HTTPException(
            status_code=400,
            detail="Test size must be between 0.1 and 0.4.",
        )

    if df.empty or len(df) < 10:
        raise HTTPException(
            status_code=400,
            detail="At least 10 rows are required for training.",
        )

    data = df.dropna(subset=[target_column]).copy()

    if data[target_column].nunique() < 2:
        raise HTTPException(
            status_code=400,
            detail="The target must contain at least two distinct values.",
        )

    if task_type == "regression":
        target = pd.to_numeric(data[target_column], errors="coerce")
        data = data.loc[target.notna()].copy()
        target = target.loc[target.notna()]

        if target.nunique() < 2:
            raise HTTPException(
                status_code=400,
                detail="Regression requires at least two distinct numeric target values.",
            )
    else:
        target = data[target_column]

        if target.nunique() > 50:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Classification target has more than 50 classes. "
                    "Choose a suitable target column."
                ),
            )

    features = data.drop(columns=[target_column])

    features = features.dropna(axis=1, how="all")
    features = features.loc[:, features.nunique(dropna=True) > 1]

    if features.empty:
        raise HTTPException(
            status_code=400,
            detail="At least one usable feature column is required.",
        )

    for column in features.columns:
        if features[column].dtype == "object":
            converted = pd.to_numeric(features[column], errors="coerce")

            if converted.notna().sum() == features[column].notna().sum():
                features[column] = converted

    numeric_features = features.select_dtypes(include="number").columns.tolist()
    categorical_features = features.select_dtypes(exclude="number").columns.tolist()

    transformers = []

    if numeric_features:
        numeric_pipeline = Pipeline(
            [
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]
        )
        transformers.append(("numeric", numeric_pipeline, numeric_features))

    if categorical_features:
        categorical_pipeline = Pipeline(
            [
                ("imputer", SimpleImputer(strategy="mode")),
                ("encoder", OneHotEncoder(handle_unknown="ignore")),
            ]
        )
        transformers.append(("catrgorical", categorical_pipeline, categorical_features))

    preprocessor = ColumnTransformer(transformers=transformers)

    model = (
        LogisticRegression(max_iter=1000)
        if task_type == "classification"
        else LinearRegression()
    )

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
        raise HTTPException(
            status_code=400,
            detail=f"Unable to train the model: {exc}",
        ) from exc

    if task_type == "classification":
        metrics = {
            "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
            "precision_weighted": round(
                float(
                    precision_score(
                        y_test, predictions, average="weighted", zero_division=0
                    )
                ),
                4,
            ),
            "recall_weighted": round(
                float(
                    recall_score(
                        y_test, predictions, average="weighted", zero_division=0
                    )
                ),
                4,
            ),
            "f1_weighted": round(
                float(
                    f1_score(y_test, predictions, average="weighted", zero_division=0)
                ),
                4,
            ),
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
        "model": (
            "Logistic Regression"
            if task_type == "classification"
            else "Linear Regression"
        ),
        "target_column": target_column,
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "feature_count": int(features.shape[1]),
        "metrics": metrics,
    }


@app.post("/api/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):  # noqa: B008
    content = await file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 10 MB.",
        )

    validate_csv(file.filename or "", content)

    df = pd.read_csv(io.BytesIO(content))

    memory_usage_bytes = int(df.memory_usage(deep=True).sum())
    rows, columns = df.shape
    column_types = df.dtypes.astype(str).to_dict()

    numeric_df = df.select_dtypes(include="number")
    histograms = create_histograms(numeric_df)
    numeric_columns = numeric_df.columns.tolist()
    non_numeric_columns = [
        column for column in df.columns if column not in numeric_columns
    ]
    categorical_distributions = create_categorical_distributions(
        df, non_numeric_columns
    )
    constant_columns = [column for column in df.columns if df[column].nunique() <= 1]
    numeric_text_columns = [
        column
        for column in non_numeric_columns
        if pd.to_numeric(df[column], errors="coerce").notna().sum()
        == df[column].notna().sum()
        and df[column].notna().any()
    ]
    mixed_type_columns = [
        column
        for column in df.columns
        if df[column].notna().any()
        and pd.to_numeric(df[column], errors="coerce").notna().any()
        and (
            pd.to_numeric(df[column], errors="coerce").notna().sum()
            < df[column].notna().sum()
        )
    ]
    empty_columns = [column for column in df.columns if df[column].isna().all()]

    missing_by_column = df.isnull().sum()
    total_missing = int(missing_by_column.sum())
    missing_percentage = ((missing_by_column / len(df)) * 100).round(2)
    high_missing_columns = [
        column for column, percentage in missing_percentage.items() if percentage > 50
    ]

    duplicate_rows = int(df.duplicated().sum())
    duplicate_percentage = ((duplicate_rows / len(df)) * 100).__round__(2)

    unique_values_by_column = df.nunique().to_dict()

    if not numeric_df.empty:
        numeric_stats = numeric_df.agg(["mean", "median", "min", "max"])
        numeric_stats = numeric_stats.to_dict()

        numeric_stats = {
            column: {
                statistic: (float(value) if pd.notna(value) else None)
                for statistic, value in statistics.items()
            }
            for column, statistics in numeric_stats.items()
        }
    else:
        numeric_stats = {}

    possible_id_columns = [
        column
        for column in df.columns
        if len(df) > 0 and df[column].notna().all() and df[column].nunique() == len(df)
    ]

    dataset_summary = {
        "rows": rows,
        "columns": columns,
        "numeric_columns_count": len(numeric_columns),
        "non_numeric_columns_count": len(non_numeric_columns),
        "numeric_text_columns_count": len(numeric_text_columns),
        "total_missing": total_missing,
        "duplicate_rows": duplicate_rows,
        "columns_with_missing_values": int((missing_by_column > 0).sum()),
        "constant_columns_count": len(constant_columns),
        "possible_id_columns_count": len(possible_id_columns),
        "empty_columns_count": len(empty_columns),
        "high_missing_columns_count": len(high_missing_columns),
        "high_cardinality_columns_count": sum(
            df[column].nunique() / len(df) > 0.9 for column in df.columns
        ),
        "mixed_type_columns_count": len(mixed_type_columns),
    }

    dataset_warnings = []

    if rows < 100:
        dataset_warnings.append(
            "This dataset has fewer than 100 rows. "
            "Model evaluation may be less reliable."
        )

    for column in df.columns:
        if df[column].nunique() / len(df) > 0.9:
            dataset_warnings.append(
                f"Column '{column}' has high cardinality "
                "(more than 90% unique values)."
            )

    for column in mixed_type_columns:
        dataset_warnings.append(
            f"Column '{column}' contains both numeric and non-numeric "
            "values. Review it before model training."
        )

    for column in empty_columns:
        dataset_warnings.append(f"Column '{column}' contains only missing values.")

    return {
        "message": "CSV file validated successfully.",
        "filename": file.filename,
        "size_bytes": len(content),
        "memory_usage_bytes": memory_usage_bytes,
        "rows": rows,
        "columns": columns,
        "column_types": column_types,
        "numeric_columns": numeric_columns,
        "non_numeric_columns": non_numeric_columns,
        "constant_columns": constant_columns,
        "numeric_text_columns": numeric_text_columns,
        "mixed_type_columns": mixed_type_columns,
        "empty_columns": empty_columns,
        "missing_by_column": {
            column: int(count) for column, count in missing_by_column.items()
        },
        "total_missing": total_missing,
        "missing_percentage": {
            column: float(percentage)
            for column, percentage in missing_percentage.items()
        },
        "high_missing_columns": high_missing_columns,
        "duplicate_rows": duplicate_rows,
        "duplicate_percentage": duplicate_percentage,
        "unique_values_by_column": {
            column: int(count) for column, count in unique_values_by_column.items()
        },
        "numeric_stats": numeric_stats,
        "possible_id_columns": possible_id_columns,
        "dataset_summary": dataset_summary,
        "dataset_warnings": dataset_warnings,
        "histograms": histograms,
        "categorical_distributions": categorical_distributions,
    }


@app.post("/api/models/train")
async def train_model(
    file: UploadFile = File(...),  # noqa: B008
    target_column: str = Form(...),
    task_type: str = Form(...),
    test_size: float = Form(0.2),
):
    content = await file.read(MAX_FILE_SIZE + 1)

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size exceeds the 10 MB limit.",
        )

    validate_csv(file.filename or "", content)

    try:
        df = pd.read_csv(io.BytesIO(content))
    except (ValueError, pd.errors.ParserError, UnicodeDecodeError) as exc:
        raise HTTPException(
            status_code=400,
            detail="Unable to read the uploaded CSV file.",
        ) from exc

    result = train_baseline_model(
        df=df, target_column=target_column, task_type=task_type, test_size=test_size
    )

    return {
        "message": "Model trained successfully.",
        **result,
    }
