# register_control.py - handles user registration business logic

from entity.useraccount import UserAccountEntity
from utils.security import hash_password


class RegisterControl:

    # Initializes the Entity to access user account database operations
    def __init__(self, db):
        self.user_entity = UserAccountEntity(db)

    def execute(self, register_data):
        existing_user = self.user_entity.get_by_email(
            register_data.email
        )

        if existing_user:
            raise ValueError("User already exist")

        user_data = {
            "email": register_data.email,
            "password_hash": hash_password(register_data.password),
            "role": register_data.role,
            "name": register_data.name,
            "surname": register_data.surname,
            "phone_no": register_data.phone_no,
        }

        # Return newly registered user back to boundary
        return self.user_entity.create(user_data)