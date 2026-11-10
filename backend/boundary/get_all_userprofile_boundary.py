# get_alluserprofile_boundary.py - Boundary to get all user profiles

from fastapi import APIRouter
from control.get_all_userprofile_control import GetAllUserProfileControl

router = APIRouter()

# Initialise the controller object
get_all_userprofile_control = GetAllUserProfileControl() 

# get all user profiles endpoint
@router.get("/get_all_userprofile")
def get_all_user_profiles():

        # Call the controller method
        user_profiles = get_all_userprofile_control.get_all_user_profiles()

        return [
            {
                "profile_id": user_profile.profile_id,
                "role": user_profile.role,
                "description": user_profile.description
            }
            for user_profile in user_profiles
        ]
