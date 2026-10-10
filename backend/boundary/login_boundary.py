# login_boundary.py - boundary for user login

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from database.database import get_db 
from schemas.login_schema import LoginRequest, LoginResponse
from control.login_control import login_useraccount 
from utils.jsonwebtoken import create_access_token


router = APIRouter()

# Login a user
@router.post("/login",response_model=LoginResponse,status_code=status.HTTP_200_OK)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):

    try:
        # call to login user
        user = login_useraccount(db, data)

         # call to create token using the user's database role
        token = create_access_token(user.user_id, user.role)

        # store token in an HTTP-only cookie
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,  # HTTP in dev - switch to TRUE if HTTPS
            samesite="lax",
            max_age=15 * 60,
            path="/",
        )

        return LoginResponse( 
            message = f"Welcome {user.name}",
            #name=user.name,
            #role=user.role.value,
            )

    except ValueError as error:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = str(error),
        ) from error

