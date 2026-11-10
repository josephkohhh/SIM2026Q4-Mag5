# get_userprofile_control.py - handles retrieving a user profile by ID

from entity.userprofile import UserProfileEntity


class GetUserProfileControl:

    # Initialise the entity object
    def __init__(self):
        self.userprofile_entity = UserProfileEntity()

    # Call the Entity method
    def get_userprofile(self, role: str):
        return self.userprofile_entity.get_by_role(role)

