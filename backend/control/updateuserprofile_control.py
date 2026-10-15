
# updateuserprofile_control.py

from entity.userprofile import UserProfile


def update_userprofile(db, profile_id, update_data):

    # Find existing user profile
    user_profile = (
        db.query(UserProfile)
        .filter(UserProfile.profile_id == profile_id)
        .first()
    )

    if not user_profile:
        raise LookupError("User profile not found")

    # Get only fields provided by the admin
    update_fields = update_data.model_dump(exclude_unset=True)

    if not update_fields:
        raise ValueError("No fields provided for update")

    # Validate and update profile fields
    for field, value in update_fields.items():

        if field == "role":
            value = value.strip()

            if not value:
                raise ValueError("Role name cannot be empty")

            existing_profile = (
                db.query(UserProfile)
                .filter(
                    UserProfile.role == value,
                    UserProfile.profile_id != profile_id
                )
                .first()
            )

            if existing_profile:
                raise ValueError("Role name already exists")

        elif field == "description":
            value = value.strip()

            if not value:
                raise ValueError("Description cannot be empty")

        setattr(user_profile, field, value)

    db.commit()
    db.refresh(user_profile)

    return user_profile
