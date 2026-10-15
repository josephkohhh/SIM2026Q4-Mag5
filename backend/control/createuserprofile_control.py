# createuserprofile_control.py - service for handling user profile creation

from entity.userprofile import UserProfile

# Create a userprofile
def create_userprofile(db, userprofile_data):

    # Check whether email already exists
    existing_role = (
        db.query(UserProfile)
        .filter(UserProfile.role == userprofile_data.role)
        .first()
    )

    if existing_role:
        raise ValueError("Role already created")


    # Create user entity
    new_userprofile = UserProfile(
        role = userprofile_data.role,
        description = userprofile_data.description
    )

    # Save to database
    db.add(new_userprofile)
    db.commit()
    db.refresh(new_userprofile)

    return new_userprofile

