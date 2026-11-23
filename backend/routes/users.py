from auth import require_auth
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/api", tags=["users"])


@router.get("/health")
def health_check():
    return {"status": "healthy"}


@router.get("/me")
async def get_current_user(user_id: str = Depends(require_auth)):
    return {"authenticated": True, "user_id": user_id}
