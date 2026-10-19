# update_userprofile_control.py - handles user profile update business logic

from entity.userprofile import UserProfileEntity


class UpdateUserProfileControl:

    # Initializes the entity object
    def __init__(self):
        self.userprofile_entity = UserProfileEntity()

    # Call the Entity method
    def update_userprofile(self, profile_id: int, update_data: dict):
        return self.userprofile_entity.update_userprofile(profile_id, update_data)


    