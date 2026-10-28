from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_upload_rejects_non_csv_file():
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("sample.txt", b"hello", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only CSV files are allowed."


def test_upload_rejects_empty_file():
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("empty.csv", b"", "text/csv")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "The uploaded file is empty."


def test_upload_rejects_duplicate_column_names():
    csv_content = b"name,age,name\nAlice,20,Ali\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("duplicates.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == ("Duplicate column names are not allowed.")


def test_upload_rejects_missing_headers():
    csv_content = b",,\nAlice,20,hello\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("missing_headers.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == ("The CSV file must contain column headers.")


def test_upload_rejects_empty_column_name():
    csv_content = b"name,,age\nAlice,hello,20\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("empty_column.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Column names cannot be empty."


def test_upload_rejects_headers_without_data():
    csv_content = b"name,age\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("headers_only.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "The CSV file must contain at least one data row."
    )


def test_upload_rejects_malformed_csv():
    csv_content = b'name,age\n"Alice,20\n'

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("malformed.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == ("The CSV file is malformed or unreadable.")


def test_upload_accepts_valid_csv():
    csv_content = b"name,age,salary\nAlice,20,50000\nBob,25,60000\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("valid.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "CSV file validated successfully."


def test_upload_returns_correct_dataset_shape():
    csv_content = b"name,age\nAlice,20\nBob,25\nCharlie,30\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("dataset.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["rows"] == 3
    assert data["columns"] == 2
    assert data["dataset_summary"]["rows"] == 3
    assert data["dataset_summary"]["columns"] == 2


def test_upload_reports_missing_values():
    csv_content = (
        b"name,age,salary\n" b"Alice,20,50000\n" b"Bob,,60000\n" b"Charlie,30,\n"
    )

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("missing.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["total_missing"] == 2
    assert data["missing_by_column"]["age"] == 1
    assert data["missing_by_column"]["salary"] == 1
    assert data["dataset_summary"]["columns_with_missing_values"] == 2


def test_upload_reports_duplicate_rows():
    csv_content = b"name,age\n" b"Alice,20\n" b"Bob,25\n" b"Bob,25\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("duplicates.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["duplicate_rows"] == 1
    assert data["duplicate_percentage"] == 33.33
    assert data["dataset_summary"]["duplicate_rows"] == 1


def test_upload_returns_numeric_statistics():
    csv_content = b"name,age\nAlice,20\nBob,30\nCharlie,40\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("numeric.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["numeric_columns"] == ["age"]
    assert data["numeric_stats"]["age"]["mean"] == 30.0
    assert data["numeric_stats"]["age"]["median"] == 30.0
    assert data["numeric_stats"]["age"]["min"] == 20.0
    assert data["numeric_stats"]["age"]["max"] == 40.0


def test_upload_returns_column_types():
    csv_content = b"name,age\nAlice,20\nBob,30\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("types.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["column_types"]["name"] in ("object", "str", "string")
    assert data["column_types"]["age"] in ("int64", "int32")
    assert data["numeric_columns"] == ["age"]
    assert data["non_numeric_columns"] == ["name"]


def test_upload_detects_constant_columns():
    csv_content = (
        b"name,country,age\n"
        b"Alice,India,20\n"
        b"Bob,India,25\n"
        b"Charlie,India,30\n"
    )

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("constant.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["constant_columns"] == ["country"]
    assert data["dataset_summary"]["constant_columns_count"] == 1


def test_upload_detects_possible_id_columns():
    csv_content = b"customer_id,age\nC101,20\nC102,25\nC103,30\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("ids.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["possible_id_columns"] == ["customer_id", "age"]
    assert data["dataset_summary"]["possible_id_columns_count"] == 2


def test_upload_reports_unique_values():
    csv_content = b"city\nDelhi\nDelhi\nKanpur\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("unique.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["unique_values_by_column"]["city"] == 2


def test_upload_reports_missing_percentages():
    csv_content = b"name,age\nAlice,20\nBob,\nCharlie,30\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("percentages.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["missing_percentage"]["age"] == 33.33
    assert data["missing_percentage"]["name"] == 0.0


def test_upload_detects_empty_columns():
    csv_content = b"name,score\nAlice,\nBob,\nCharlie,\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("empty_columns.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["empty_columns"] == ["score"]
    assert data["dataset_summary"]["empty_columns_count"] == 1
    assert "score" in data["high_missing_columns"]


def test_upload_detects_mixed_type_columns():
    csv_content = b"name,age\nAlice,20\nBob,unknown\nCharlie,30\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("mixed.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200
    data = response.json()

    assert "age" in data["mixed_type_columns"]
    assert any(
        "age" in warning and "numeric and non-numeric" in warning
        for warning in data["dataset_warnings"]
    )


def test_upload_detects_high_cardinality_columns():
    csv_content = (
        b"customer_id,age\n" b"C101,20\n" b"C102,25\n" b"C103,30\n" b"C104,35\n"
    )

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("cardinality.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["dataset_summary"]["high_cardinality_columns_count"] == 2
    assert any(
        "customer_id" in warning and "high cardinality" in warning
        for warning in data["dataset_warnings"]
    )


def test_upload_returns_memory_usage_and_file_size():
    csv_content = b"name,age\nAlice,20\nBob,25\n"

    response = client.post(
        "/api/datasets/upload",
        files={"file": ("memory.csv", csv_content, "text/csv")},
    )

    assert response.status_code == 200
    data = response.json()

    assert data["size_bytes"] == len(csv_content)
    assert data["memory_usage_bytes"] > 0
