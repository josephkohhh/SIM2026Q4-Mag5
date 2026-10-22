# get_userprofile_boundary.py - boundary for retrieving a user profile by ID

from fastapi import APIRouter, HTTPException
from control.get_userprofile_control import GetUserProfileControl

router = APIRouter()

# Call the controller
get_userprofile_control = GetUserProfileControl()

# get user profile by role endpoint
@router.get("/get_userprofile/{role}")
def get_userprofile(role: str):
    try:
        return get_userprofile_control.get_userprofile(role)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error