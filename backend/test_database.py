
from uuid import uuid4

from database import (
    datasets_collection,
    delete_user_dataset,
    get_user_dataset,
    get_user_datasets,
    save_dataset,
)


def test_dataset_operations():
    user_id = "test_user_123"
    dataset_id = str(uuid4())

    dataset = {
        "_id": dataset_id,
        "user_id": user_id,
        "filename": "test.csv",
        "rows": 10,
        "columns": 3,
        "file_size": 1024,
    }

    try:
        # 1. Save dataset
        save_dataset(dataset)
        print("\nDataset saved!")

        # 2. Retrieve using our function
        result = get_user_dataset(dataset_id, user_id)

        print("\n--- Debugging retrieval ---")
        print("Dataset ID:", dataset_id)
        print("User ID:", user_id)
        print("Function result:", result)

        # 3. Retrieve directly from MongoDB
        direct_result = datasets_collection.find_one({
            "_id": dataset_id,
            "user_id": user_id
        })

        print("Direct MongoDB result:", direct_result)

        # 4. Verify retrieval
        assert result is not None, "get_user_dataset returned None"
        assert result["filename"] == "test.csv"
        print("\nDataset retrieval successful!")

        # 5. List user's datasets
        results = get_user_datasets(user_id)

        assert any(item["_id"] == dataset_id for item in results)
        print("Dataset listing successful!")

        # 6. Check ownership protection
        wrong_user = get_user_dataset(dataset_id, "another_user")

        assert wrong_user is None
        print("Ownership check successful!")

    finally:
        # 7. Cleanup test document
        delete_user_dataset(dataset_id, user_id)
        print("Test document cleanup completed!")

    print("\nAll MongoDB tests passed!")


if __name__ == "__main__":
    test_dataset_operations()
