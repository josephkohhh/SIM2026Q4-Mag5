# create_useraccount_boundary.py - boundary for admin to create user account

from fastapi import APIRouter, HTTPException
from control.create_useraccount_control import CreateUserAccountControl

router = APIRouter()

# Initialise the controller object
create_useraccount_control = CreateUserAccountControl()

# Create user profile endpoint
@router.post("/create_useraccount")
def create_useraccount(user_data: dict):

    try:
        # Call the controller method
        return create_useraccount_control.create_useraccount(user_data)

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