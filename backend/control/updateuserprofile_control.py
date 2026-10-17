# updateuserprofile_control.py - handles user profile update business logic

from entity.userprofile import UserProfileEntity


class UpdateUserProfileControl:

    # Initializes the Entity for accessing user profile
    def __init__(self, db):
        self.userprofile_entity = UserProfileEntity(db)

    def execute(self, profile_id: int, update_data):
        profile = self.userprofile_entity.get_by_id(profile_id)

        if not profile:
            raise LookupError("User profile not found")

        updates = update_data.model_dump(exclude_unset=True)

        if not updates:
            raise ValueError("No fields provided for update")

        existing_profile = self.userprofile_entity.get_by_role(
            updates.get("role", profile.role)
        )

        if existing_profile and existing_profile.profile_id != profile_id:
            raise ValueError("Role already exists")


        # Return the updated user profile back to Boundary
        return self.userprofile_entity.update(profile, updates)
    