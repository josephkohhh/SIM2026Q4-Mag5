# login_boundary.py - handles login requests and HTTP responses

from fastapi import APIRouter, HTTPException, Response
from control.login_control import LoginControl

# Initialise the controller object
login_control = LoginControl()

router = APIRouter()

# login endpoint
@router.post("/login")
def login(login_data: dict, response: Response):
    try:
        # Call the controller method
        result = login_control.login_user(login_data)

        token = result["access_token"]

        # Set token in an HttpOnly cookie
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False, # True only in HTTPS
            samesite="lax",
            max_age=15 * 60,
            path="/",
        )

        return {
            "message": result["message"]
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        ) from error        