from fastapi import APIRouter, Request, HTTPException
from utils.jsonwebtoken import verify_access_token

router = APIRouter()


@router.get("/profile")
def get_profile(request: Request):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    try:
        payload = verify_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    return {
        "message": "JWT is valid",
        "user_id": payload["sub"],
        "role": payload["role"],
    }