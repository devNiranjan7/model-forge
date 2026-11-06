from storage import (
    check_r2_connection,
    delete_file,
    download_file,
    upload_file,
)


def test_r2_storage():
    assert check_r2_connection()

    object_key = "test/model-forge-test.csv"
    original_data = b"name,price\nHouse,500000\n"

    # Upload
    upload_file(original_data, object_key)
    print("Upload successful!")

    # Download
    downloaded_data = download_file(object_key)
    assert downloaded_data == original_data
    print("Download successful!")

    # Delete
    delete_file(object_key)
    print("Delete successful!")

    print("All R2 tests passed!")


if __name__ == "__main__":
    test_r2_storage()
