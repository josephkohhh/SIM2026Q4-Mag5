# register_control.py - handles user registration

from entity.useraccount import UserAccountEntity, RoleEnum


class RegisterControl:

    # Initialise the entity object
    def __init__(self):
        self.useraccount_entity = UserAccountEntity()

    # Register method
    def register_useraccount(self, user_data: dict):        
        
        # Call the entity method
        return self.useraccount_entity.create(user_data)
