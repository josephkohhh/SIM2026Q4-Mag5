# create_useraccount_control.py - handles user account creation 

from entity.useraccount import UserAccountEntity

class CreateUserAccountControl:

    # Initialise the entity object
    def __init__(self):
        self.useraccount_entity = UserAccountEntity()

    # Call the Entity method
    def create_useraccount(self, user_data: dict):
        return self.useraccount_entity.create(user_data)