# login_boundary.py - handles login requests and HTTP responses

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.login_schema import LoginRequest, LoginResponse
from control.login_control import LoginControl


router = APIRouter()

# login endpoint
@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    try:
        # Authenticate the user and obtain the access token
        control = LoginControl(db)
        user, token = control.execute(data)

        # Setting token in a HTTP-only cookie is a Boundary responsibilty
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,  # Use True when deployed over HTTPS
            samesite="lax",
            max_age=15 * 60,
            path="/",
        )

        # Return the login success response
        return LoginResponse(
            message=f"Welcome {user.name}",
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
        ) from error
