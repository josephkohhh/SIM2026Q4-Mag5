# create_userprofile_control.py - handles creating a user profile

from entity.userprofile import UserProfileEntity

class CreateUserProfileControl:

    # Initialise the entity object
    def __init__(self):
        self.userprofile_entity = UserProfileEntity()

    # Call the Entity method
    def create_userprofile(self, profile_data: dict):
        return self.userprofile_entity.create_userprofile(profile_data)