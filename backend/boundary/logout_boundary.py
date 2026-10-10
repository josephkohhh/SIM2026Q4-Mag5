# logout_boundary.py - boundary for user logout

from fastapi import APIRouter, Response, status
from control.logout_control import logout_useraccount

router = APIRouter()

# Logout a user
@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response):

    # Call logout control
    result = logout_useraccount()

    # Clear authentication cookie
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=True,
        samesite="lax",
    )

    return result

