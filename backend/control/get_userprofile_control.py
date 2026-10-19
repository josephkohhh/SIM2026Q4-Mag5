# get_userprofile_control.py - handles retrieving a user profile by ID

from entity.userprofile import UserProfileEntity


class GetUserProfileControl:

    # Initialise the entity object
    def __init__(self):
        self.userprofile_entity = UserProfileEntity()

    # Call the Entity method
    def get_by_role(self, role: str):
        user_profile = self.userprofile_entity.get_by_role(role)

        return {
          "profile_id": user_profile.profile_id,
          "role": user_profile.role,
          "description": user_profile.description
        }