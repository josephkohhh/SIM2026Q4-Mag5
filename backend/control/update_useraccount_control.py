# update_useraccount_control.py - handles user account update business logic

from entity.useraccount import UserAccountEntity


class UpdateUserAccountControl:

    # Initializes the entity object
    def __init__(self):
        self.userprofile_entity = UserAccountEntity()

    # Call the Entity method
    def update_useraccount(self, email: str, update_data: dict):
        return self.userprofile_entity.update(email, update_data)