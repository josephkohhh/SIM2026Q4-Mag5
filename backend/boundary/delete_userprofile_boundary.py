# delete_userprofile_boundary.py - boundary for deleting a user profile

from fastapi import APIRouter, HTTPException
from control.delete_userprofile_control import DeleteUserProfileControl

router = APIRouter()

# Initialise the controller object
delete_userprofile_control = DeleteUserProfileControl()

# Delete user profile endpoint
@router.delete("/delete_userprofile/{role}")
def delete_userprofile(role: str):
    try:
        # Call the controller method
        return delete_userprofile_control.delete_userprofile(role)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error