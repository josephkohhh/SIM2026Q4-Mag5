# createuserprofile_control.py - handles user profile creation business logic

from entity.userprofile import UserProfileEntity


class CreateUserProfileControl:

    # Initializes the Entity for accessing user profile data
    def __init__(self, db):
        self.userprofile_entity = UserProfileEntity(db)

    def execute(self, userprofile_data):

        # Check whether the role is already created
        existing_profile = self.userprofile_entity.get_by_role(
            userprofile_data.role
        )

        if existing_profile:
            raise ValueError("Role already exists")

        # Prepare the new role's info
        profile_data = {
            "role": userprofile_data.role,
            "description": userprofile_data.description
        }
        
        # Return newly created userprofile to Boundary
        return self.userprofile_entity.create(profile_data)