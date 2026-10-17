# updateuseraccount_control.py - handles user account update business logic

from entity.useraccount import UserAccountEntity


class UpdateUserAccountControl:

    # Initializes the Entity for accessing user account
    def __init__(self, db):
        self.user_entity = UserAccountEntity(db)

    def execute(self, user_email: str, update_data):
        user = self.user_entity.get_by_email(user_email)

        if not user:
            raise LookupError("User account not found")

        updates = update_data.model_dump(exclude_unset=True)

        if not updates:
            raise ValueError("No fields provided for update")

        # Return the updated user info back to Boundary
        return self.user_entity.update(user, updates)