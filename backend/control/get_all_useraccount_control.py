# get_all_useraccount_control.py - handles retrieving all user account

from entity.useraccount import UserAccountEntity

# Controller responsible for handling the request to retrieve all user account 
class GetAllUserAccountControl:

    # Initialise the entity object
    def __init__(self):
        self.useraaccount_entity = UserAccountEntity()

    # Call the Entity method
    def get_all_user_accounts(self):
        return self.useraaccount_entity.get_all()