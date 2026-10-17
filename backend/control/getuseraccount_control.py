# getuseraccount_control.py - handles retrieving user account business logic

from entity.useraccount import UserAccountEntity


class GetUserAccountControl:

    # Initializes the Entity for accessing user email
    def __init__(self, db):
        self.user_entity = UserAccountEntity(db)

    def execute(self, user_email: str):
        user = self.user_entity.get_by_email(user_email)

        if not user:
            raise LookupError("User account not found")

        # Return user info back to Boundary
        return user
