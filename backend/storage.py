import os

import boto3
from dotenv import load_dotenv

load_dotenv()

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL")

required_variables = {
    "R2_ACCOUNT_ID": R2_ACCOUNT_ID,
    "R2_ACCESS_KEY_ID": R2_ACCESS_KEY_ID,
    "R2_SECRET_ACCESS_KEY": R2_SECRET_ACCESS_KEY,
    "R2_BUCKET_NAME": R2_BUCKET_NAME,
    "R2_ENDPOINT_URL": R2_ENDPOINT_URL,
}

missing_variables = [name for name, value in required_variables.items() if not value]

if missing_variables:
    raise RuntimeError(
        f"Missing R2 environment variables: {', '.join(missing_variables)}"
    )

s3_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT_URL,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name="auto",
)


def check_r2_connection():
    try:
        s3_client.head_bucket(Bucket=R2_BUCKET_NAME)
        return True
    except Exception as error:  # noqa: BLE001
        print(f"R2 connection failed: {error}")
        return False


def upload_file(file_data: bytes, object_key: str):
    s3_client.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=object_key,
        Body=file_data,
        ContentType="text/csv",
    )


def download_file(object_key: str):
    response = s3_client.get_object(
        Bucket=R2_BUCKET_NAME,
        Key=object_key,
    )
    return response["Body"].read()


def delete_file(object_key: str):
    s3_client.delete_object(
        Bucket=R2_BUCKET_NAME,
        Key=object_key,
    )
