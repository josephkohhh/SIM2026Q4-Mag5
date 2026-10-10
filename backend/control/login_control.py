# login_control.py - service for handling user login

from entity.useraccount import UserAccount, StatusEnum
from utils.security import verify_password

# Login a user
def login_useraccount(db, login_data):

    # Check whether email exists
    existing_user = (
        db.query(UserAccount)
        .filter(UserAccount.email == login_data.email)
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

    # Check whether the account is active
    if existing_user.status != StatusEnum.ACTIVE:
        raise ValueError("This account has been suspended")

    # Return authenticated user
    return existing_user