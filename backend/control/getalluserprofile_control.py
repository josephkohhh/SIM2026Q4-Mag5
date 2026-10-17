# getalluserprofile_control.py - Control to get all user profiles

from entity.userprofile import UserProfileEntity

class GetAllUserProfileControl:

    # Initializes the Entity for accessing all user profile
    def __init__(self, db):
        self.userprofile_entity = UserProfileEntity(db)

    def execute(self):
        # Return list of user profile back to Boundary
        return self.userprofile_entity.get_all()