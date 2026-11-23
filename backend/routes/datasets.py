import io
from datetime import UTC, datetime
from uuid import uuid4

import pandas as pd
from auth import require_auth
from database import (
    delete_user_dataset,
    get_user_dataset,
    get_user_datasets,
    save_dataset,
)
from dataset_analysis import MAX_FILE_SIZE, inspect_dataframe, validate_csv
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from storage import delete_file, download_file, upload_file

router = APIRouter(prefix="/api/datasets", tags=["datasets"])


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),  # noqa: B008
    user_id: str = Depends(require_auth),
):
    content = await file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File size must not exceed 40 MB.")

    validate_csv(file.filename or "", content)
    df = pd.read_csv(io.BytesIO(content))
    inspection = inspect_dataframe(df)

    dataset_id = str(uuid4())
    storage_key = f"users/{user_id}/dataset/{dataset_id}.csv"
    created_at = datetime.now(UTC)

    try:
        upload_file(content, storage_key)
    except Exception as error:
        raise HTTPException(status_code=500, detail="Unable to store dataset file.") from error

    dataset_metadata = {
        "_id": dataset_id,
        "user_id": user_id,
        "filename": file.filename or "dataset.csv",
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "file_size": len(content),
        "storage_key": storage_key,
        "created_at": created_at,
    }

    try:
        save_dataset(dataset_metadata)
    except Exception as error:
        try:
            delete_file(storage_key)
        except Exception as cleanup_error:  # noqa: BLE001
            print(f"R2 cleanup failed: {cleanup_error}")
        raise HTTPException(status_code=500, detail="Unable to save dataset information.") from error

    return {
        "message": "CSV file validated successfully.",
        "dataset_id": dataset_id,
        "created_at": created_at.isoformat(),
        "storage_key": storage_key,
        "filename": file.filename,
        "size_bytes": len(content),
        **inspection,
    }


@router.get("")
async def list_datasets(user_id: str = Depends(require_auth)):
    datasets = get_user_datasets(user_id)
    return {
        "datasets": [
            {
                "dataset_id": dataset["_id"],
                "filename": dataset["filename"],
                "rows": dataset["rows"],
                "columns": dataset["columns"],
                "file_size": dataset["file_size"],
                "created_at": dataset["created_at"].isoformat() if dataset.get("created_at") else None,
            }
            for dataset in datasets
        ]
    }


@router.get("/{dataset_id}")
async def get_dataset(dataset_id: str, user_id: str = Depends(require_auth)):
    dataset = get_user_dataset(dataset_id, user_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    try:
        content = download_file(dataset["storage_key"])
        df = pd.read_csv(io.BytesIO(content))
    except Exception as error:
        raise HTTPException(status_code=500, detail="Unable to retrieve dataset file.") from error

    inspection = inspect_dataframe(df)
    return {
        "dataset_id": dataset["_id"],
        "filename": dataset["filename"],
        "size_bytes": dataset["file_size"],
        "created_at": dataset["created_at"].isoformat() if dataset.get("created_at") else None,
        **inspection,
    }


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str, user_id: str = Depends(require_auth)):
    dataset = get_user_dataset(dataset_id, user_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    try:
        delete_file(dataset["storage_key"])
    except Exception as error:
        raise HTTPException(status_code=500, detail="Unable to delete dataset file.") from error

    result = delete_user_dataset(dataset_id, user_id)
    if result.deleted_count != 1:
        raise HTTPException(status_code=500, detail="Unable to delete dataset information.")

    return {"message": "Dataset deleted successfully.", "dataset_id": dataset_id}
