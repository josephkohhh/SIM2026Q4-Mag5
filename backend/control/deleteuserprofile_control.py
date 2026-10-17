# deleteuserprofile_control.py - handles user profile deletion business logic

from entity.userprofile import UserProfileEntity


class DeleteUserProfileControl:

    # Initializes the Entity for accessing user account
    def __init__(self, db):
        self.userprofile_entity = UserProfileEntity(db)

    def execute(self, profile_id: int):
        user_profile = self.userprofile_entity.get_by_id(profile_id)

        if not user_profile:
            raise LookupError("User profile not found")

        # Return the deleted userprofile info back to Boundary
        return self.userprofile_entity.delete(user_profile)
