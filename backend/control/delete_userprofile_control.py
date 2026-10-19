# delete_userprofile_control.py - handles deleting a user profile

from entity.userprofile import UserProfileEntity


class DeleteUserProfileControl:

    # Initialise the entity object
    def __init__(self):
        self.userprofile_entity = UserProfileEntity()

    # Call the Entity method
    def delete_userprofile(self, role: str):
        return self.userprofile_entity.delete_userprofile(role)