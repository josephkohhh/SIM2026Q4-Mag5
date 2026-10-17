# createuseraccount_control.py - handles user account creation business logic

from entity.useraccount import UserAccountEntity
from utils.security import hash_password


class CreateUserAccountControl:

    # Initializes the Entity for accessing user account data
    def __init__(self, db):
        self.user_entity = UserAccountEntity(db)

    def execute(self, user_data):

        # Check whether the email is already registered
        existing_user = self.user_entity.get_by_email(
            user_data.email
        )

        if existing_user:
            raise ValueError("Email already registered")

        # Hash the password before storing it
        hashed_password = hash_password(user_data.password)

        # Prepare the new user's info
        user_data = {
            "email": user_data.email,
            "password_hash": hashed_password,
            "role": user_data.role,
            "name": user_data.name,
            "surname": user_data.surname,
            "phone_no": user_data.phone_no,
        }

        # Return newly created user to Boundary
        return self.user_entity.create(user_data)
