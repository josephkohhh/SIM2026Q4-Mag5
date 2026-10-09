# register_control.py - service for handling user login

from entity.user import User
from utils.security import verify_password

# Login a user
def login_user(db, login_data):

    # Check whether email exists
    existing_user = (
        db.query(User)
        .filter(User.email == login_data.email)
        .first()
    )

    if not existing_user:
        raise ValueError("Invalid email or password")

    # Verify password
    is_password_valid = verify_password(
        login_data.password,
        existing_user.password_hash
    )

    if not is_password_valid:
        raise ValueError("Invalid email or password")

    # Return authenticated user
    return existing_user