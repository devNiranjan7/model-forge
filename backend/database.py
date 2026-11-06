import os

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "modelforge")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI is missing from environment variables")

client = MongoClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=5000,
    tlsCAFile=certifi.where(),
)

db = client[MONGODB_DATABASE]


def get_database():
    return db


def check_database_connection():
    try:
        client.admin.command("ping")
        return True
    except Exception as error:  # noqa: BLE001
        print(f"MongoDB connection failed: {error}")
        return False


datasets_collection = db["datasets"]

datasets_collection.create_index([("user_id", 1), ("created_at", -1)])


def save_dataset(dataset):
    datasets_collection.insert_one(dataset)
    return dataset


def get_user_datasets(user_id):
    return list(
        datasets_collection.find(
            {"user_id": user_id},
            {
                "_id": 1,
                "filename": 1,
                "rows": 1,
                "columns": 1,
                "file_size": 1,
                "created_at": 1,
            },
        ).sort("created_at", -1)
    )


def get_user_dataset(dataset_id, user_id):
    return datasets_collection.find_one({"_id": dataset_id, "user_id": user_id})


def delete_user_dataset(dataset_id, user_id):
    return datasets_collection.delete_one({"_id": dataset_id, "user_id": user_id})
