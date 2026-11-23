import io
from datetime import UTC, datetime
from uuid import uuid4

import pandas as pd
from auth import require_auth
from database import get_user_dataset, save_experiment
from fastapi import APIRouter, Depends, Form, HTTPException
from storage import download_file
from training import train_baseline_model

router = APIRouter(prefix="/api/models", tags=["models"])


@router.post("/train")
async def train_model(
    dataset_id: str = Form(...),
    target_column: str = Form(...),
    task_type: str = Form(...),
    test_size: float = Form(0.2),
    user_id: str = Depends(require_auth),
):
    dataset = get_user_dataset(dataset_id, user_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    try:
        content = download_file(dataset["storage_key"])
        df = pd.read_csv(io.BytesIO(content))
    except Exception as error:
        raise HTTPException(status_code=500, detail="Unable to retrieve dataset file.") from error

    result = train_baseline_model(
        df=df,
        target_column=target_column,
        task_type=task_type,
        test_size=test_size,
    )

    experiment_id = str(uuid4())
    created_at = datetime.now(UTC)
    experiment = {
        "_id": experiment_id,
        "user_id": user_id,
        "dataset_id": dataset_id,
        "dataset_filename": dataset["filename"],
        "task_type": result["task_type"],
        "model": result["model"],
        "target_column": result["target_column"],
        "test_size": test_size,
        "random_state": 42,
        "train_rows": result["train_rows"],
        "test_rows": result["test_rows"],
        "feature_count": result["feature_count"],
        "metrics": result["metrics"],
        "created_at": created_at,
    }

    try:
        save_experiment(experiment)
    except Exception as error:
        raise HTTPException(status_code=500, detail="Model trained, but unable to save experiment.") from error

    return {
        "message": "Model trained successfully.",
        "experiment_id": experiment_id,
        "created_at": created_at.isoformat(),
        **result,
    }
