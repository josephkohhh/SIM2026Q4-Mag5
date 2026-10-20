# register_control.py - handles user registration

from entity.useraccount import UserAccountEntity, RoleEnum


class RegisterControl:

    # Initialise the entity object
    def __init__(self):
        self.useraccount_entity = UserAccountEntity()

    # Register method
    def register_useraccount(self, user_data: dict):
        role = user_data.get("role")
        
        # Only allow certain roles when user registers
        allowed_roles = {
            RoleEnum.CUSTOMER,
            RoleEnum.INTERIOR_DESIGNER
        }

        if role not in allowed_roles:
            raise ValueError("Invalid registration role.")
        
        # If validation pass, call the entity method
        return self.useraccount_entity.create(user_data)
