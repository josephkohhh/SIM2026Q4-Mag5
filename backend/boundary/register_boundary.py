# register_boundary.py - handles user registration requests and HTTP responses

from fastapi import APIRouter, HTTPException
from control.register_control import RegisterControl


router = APIRouter()

# Initialise the controller object
register_control = RegisterControl()

# Register endpoint
@router.post("/register")
def register_useraccount(user_data: dict):
    try:
        # Call the controller method
        return register_control.register_useraccount(user_data)

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