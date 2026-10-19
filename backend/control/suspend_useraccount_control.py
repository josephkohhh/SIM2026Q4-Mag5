# suspend_useraccount_control.py - handles user account suspension

from entity.useraccount import UserAccountEntity

class SuspendUserAccountControl:

    # Initialise the entity object
    def __init__(self):
        self.useraccount_entity = UserAccountEntity()

    # Call the Entity method
    def suspend_useraccount(self, email: str):
        return self.useraccount_entity.suspend_useraccount(email)