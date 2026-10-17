# suspenduseraccount_control.py - handles user account suspension logic

from entity.useraccount import UserAccountEntity, StatusEnum

class SuspendUserAccountControl:

    # Initializes the Entity for accessing user account
    def __init__(self, db):
        self.user_entity = UserAccountEntity(db)

    def execute(self, user_email: str):
        user = self.user_entity.get_by_email(user_email)

        if not user:
            raise LookupError("User account not found")

        if user.status == StatusEnum.INACTIVE:
            raise ValueError("User account is already suspended")

        # Return the suspended user info back to Boundary
        return self.user_entity.suspend(user)