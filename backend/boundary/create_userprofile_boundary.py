# create_userprofile_boundary.py - boundary for admin to create user profile

from fastapi import APIRouter, HTTPException
from control.create_userprofile_control import CreateUserProfileControl

router = APIRouter()

# Initialise the controller object
create_userprofile_control = CreateUserProfileControl()

# Create user profile endpoint
@router.post("/create_userprofile")
def create_userprofile(profile_data: dict):

    try:
        # Call the controller method
        return create_userprofile_control.create_userprofile(profile_data)

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