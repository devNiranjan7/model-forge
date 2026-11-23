from auth import require_auth
from database import (
    delete_user_experiment,
    get_user_experiment,
    get_user_experiments,
)
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/api/experiments", tags=["experiments"])


@router.get("")
async def list_experiments(user_id: str = Depends(require_auth)):
    experiments = get_user_experiments(user_id)
    return {
        "experiments": [
            {
                "experiment_id": experiment["_id"],
                "dataset_id": experiment["dataset_id"],
                "dataset_filename": experiment["dataset_filename"],
                "task_type": experiment["task_type"],
                "model": experiment["model"],
                "target_column": experiment["target_column"],
                "test_size": experiment["test_size"],
                "random_state": experiment["random_state"],
                "train_rows": experiment["train_rows"],
                "test_rows": experiment["test_rows"],
                "feature_count": experiment["feature_count"],
                "metrics": experiment["metrics"],
                "created_at": experiment["created_at"].isoformat() if experiment.get("created_at") else None,
            }
            for experiment in experiments
        ]
    }


@router.get("/{experiment_id}")
async def get_experiment(experiment_id: str, user_id: str = Depends(require_auth)):
    experiment = get_user_experiment(experiment_id, user_id)
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found.")
    return {
        "experiment_id": experiment["_id"],
        "dataset_id": experiment["dataset_id"],
        "dataset_filename": experiment["dataset_filename"],
        "task_type": experiment["task_type"],
        "model": experiment["model"],
        "target_column": experiment["target_column"],
        "test_size": experiment["test_size"],
        "random_state": experiment["random_state"],
        "train_rows": experiment["train_rows"],
        "test_rows": experiment["test_rows"],
        "feature_count": experiment["feature_count"],
        "metrics": experiment["metrics"],
        "created_at": experiment["created_at"].isoformat() if experiment.get("created_at") else None,
    }


@router.delete("/{experiment_id}")
async def delete_experiment(experiment_id: str, user_id: str = Depends(require_auth)):
    result = delete_user_experiment(experiment_id, user_id)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Experiment not found.")
    return {"message": "Experiment deleted successfully.", "experiment_id": experiment_id}
