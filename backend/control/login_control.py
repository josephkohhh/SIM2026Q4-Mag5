# login_control.py - handles user authentication and access token generation

from entity.useraccount import UserAccountEntity
from entity.useraccount import StatusEnum
from utils.security import verify_password
from utils.jsonwebtoken import create_access_token


class LoginControl:

    # Initializes the Entity for accessing user account data
    def __init__(self, db):
        self.user_entity = UserAccountEntity(db)

    # Authenticate the user and generate an access token
    def execute(self, login_data):

        # Verify the email exists
        existing_user = self.user_entity.get_by_email(
            login_data.email
        )

        if not existing_user:
            raise ValueError("Invalid email or password")

        # Verify the submitted password
        is_password_valid = verify_password(
            login_data.password,
            existing_user.password_hash,
        )

        if not is_password_valid:
            raise ValueError("Invalid email or password")

        # Verify whether the account is active
        if existing_user.status != StatusEnum.ACTIVE:
            raise ValueError("This account has been suspended")


        # After passing all login authentication
        # Generate an access token for the authenticated user
        token = create_access_token(
            existing_user.user_id,
            existing_user.role,
        )

        # Return the user and token to the Boundary
        return existing_user, token
