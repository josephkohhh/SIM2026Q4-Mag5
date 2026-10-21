# update_userprofile_control.py - handles user profile updates

from entity.userprofile import UserProfileEntity


class UpdateUserProfileControl:

    # Initializes the entity object
    def __init__(self):
        self.userprofile_entity = UserProfileEntity()

    # Call the Entity method
    def update_userprofile(self, role: str, update_data: dict):
        return self.userprofile_entity.update(role, update_data)


    