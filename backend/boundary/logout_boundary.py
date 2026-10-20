# logout_boundary.py - boundary for user logout

from fastapi import APIRouter, Response
from control.logout_control import LogoutControl

router = APIRouter()

# Initialise the controller object
logout_control = LogoutControl()

# logout endpoint
@router.post("/logout")
def logout(response: Response):

    # Call the controller method 
    result = logout_control.logout()

    # Clear the access_token 
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,  # Use True in production over HTTPS
        samesite="lax",
        path="/"
    )

    return result