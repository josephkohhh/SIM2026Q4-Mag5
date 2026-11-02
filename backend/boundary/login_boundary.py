# login_boundary.py - handles login requests and HTTP responses

from fastapi import APIRouter, HTTPException, Response
from control.login_control import LoginControl

# Initialise the controller object
login_control = LoginControl()

router = APIRouter()


@router.post("/login")
def login_user(login_data: dict, response: Response):
    try:
        result = login_control.login_user(login_data)

        token = result["access_token"]

        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=15 * 60,
            path="/",
        )
        return {
            "success": True,
            "user_id": result["user_id"],
            "name": result["name"],
            "surname": result["surname"],
            "role": result["role"]
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



