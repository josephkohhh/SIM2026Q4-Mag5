# access_control.py - authentication and role checks

from fastapi import Request, HTTPException
from jwt.exceptions import InvalidTokenError

from backend.utils.jsonwebtoken import verify_access_token


def get_current_user(request: Request):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    try:
        payload = verify_access_token(token)
        user_id = int(payload["sub"])
        role = payload["role"]
    except (InvalidTokenError, KeyError, ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    return {"user_id": user_id, "role": role}


def require_role(required_role: str):
    def role_checker(request: Request):
        current_user = get_current_user(request)

        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission",
            )

        return current_user

    return role_checker