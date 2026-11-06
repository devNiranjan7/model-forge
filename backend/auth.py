import os

from clerk_backend_api import AuthenticateRequestOptions, authenticate_request
from dotenv import load_dotenv
from fastapi import HTTPException, Request

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_JWT_KEY = os.getenv("CLERK_JWT_KEY")
CLERK_AUTHORIZED_PARTIES = [
    origin.strip()
    for origin in os.getenv("CLERK_AUTHORIZED_PARTIES", "").split(",")
    if origin.strip()
]

if not CLERK_SECRET_KEY:
    raise RuntimeError("CLERK_SECRET_KEY is missing from backend/.env")

if not CLERK_AUTHORIZED_PARTIES:
    raise RuntimeError("CLERK_AUTHORIZED_PARTIES is missing from backend/.env")


def require_auth(request: Request) -> str:
    options = AuthenticateRequestOptions(
        secret_key=CLERK_SECRET_KEY,
        jwt_key=CLERK_JWT_KEY.replace("\\n", "\n") if CLERK_JWT_KEY else None,
        authorized_parties=CLERK_AUTHORIZED_PARTIES,
        accepts_token=["session_token"],
    )

    auth_state = authenticate_request(request, options)

    if not auth_state.is_signed_in:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
        )

    return auth_state.payload["sub"]
