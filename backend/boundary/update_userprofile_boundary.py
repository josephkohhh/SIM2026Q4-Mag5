# update_userprofile_boundary.py - boundary for admin to update user profile

from fastapi import APIRouter, HTTPException
from control.update_userprofile_control import UpdateUserProfileControl

router = APIRouter()

# Initialise the controller object
update_userprofile_control = UpdateUserProfileControl()

# update user profile endpoint
@router.patch("/update_userprofile")
def update_userprofile(role: str,update_data: dict):

    try:
        # Call the controller method
         return update_userprofile_control.update_userprofile(role,update_data)

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
