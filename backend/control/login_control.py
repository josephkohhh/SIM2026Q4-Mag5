# login_control.py - handles user authentication and access token generation

from entity.useraccount import UserAccountEntity
from entity.useraccount import StatusEnum
from utils.security import verify_password
from utils.jsonwebtoken import create_access_token


class LoginControl:

    # Initialise the entity object
    def __init__(self):
        self.account_entity = UserAccountEntity()

    # Login method
    def login(self, login_data: dict):

        email = login_data.get("email")
        password = login_data.get("password")

        # Field validation 
        if not email or not password:
            raise ValueError("Email and password are required.")

        try:
            # Call the get_by_email entity method to get user account info
            user = self.account_entity.get_by_email(email)

        # catch email_not_found error from entity
        except LookupError:
            raise ValueError("Invalid email or password.")
            
        if user.status != StatusEnum.ACTIVE:
            raise ValueError("Account has been suspended.")

        if not verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password.")

        # Generate access token after successful validation
        access_token = create_access_token(user.user_id, user.role.value)
        
        return {
            "message": f"Welcome {user.name} !",
            "access_token": access_token
            }

        