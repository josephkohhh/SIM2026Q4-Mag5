# getuserprofile_control.py - handles retrieving user profile business logic

from entity.userprofile import UserProfileEntity


class GetUserProfileControl:

    # Initializes the Entity for accessing a user profile
    def __init__(self, db):
        self.userprofile_entity = UserProfileEntity(db)

    def execute(self, profile_id: int):
        userprofile = self.userprofile_entity.get_by_id(profile_id)

        if not userprofile:
            raise LookupError("User profile not found")

        # Return user profile back to Boundary
        return userprofile
