# deleteuserprofile_control.py - Control for deleting a user profile

from entity.userprofile import UserProfile


def delete_userprofile(db, profile_id):

    # Find existing user profile
    user_profile = (
        db.query(UserProfile)
        .filter(UserProfile.profile_id == profile_id)
        .first()
    )

    if not user_profile:
        raise LookupError("User profile not found")

    # Delete user profile
    db.delete(user_profile)
    db.commit()

    return user_profile
