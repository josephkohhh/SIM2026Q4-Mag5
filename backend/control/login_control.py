# login_control.py - handles user authentication and access token generation

from entity.useraccount import UserAccountEntity
from entity.useraccount import StatusEnum
from utils.security import verify_password
from utils.jsonwebtoken import create_access_token


class LoginControl:

    # Initialise the entity object
    def __init__(self):
        self.account_entity = UserAccountEntity()

    # Call the Entity method
    def login_user(self, login_data):
        return self.account_entity.login(login_data)

  

        