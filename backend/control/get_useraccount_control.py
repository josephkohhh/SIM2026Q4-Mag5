# get_useraccount_control.py - handles retrieving a user account by email

from entity.useraccount import UserAccountEntity


class GetUserAccountControl:

    # Initialise the entity object
    def __init__(self):
        self.useraccount_entity = UserAccountEntity()

    # Call the Entity method
    def get_useraccount(self, email: str):
        user_account = self.useraccount_entity.get_by_email(email)

        # Return specific fields ooly  
        return {
          "user_id": user_account.user_id,  
          "email": user_account.email,
          "role": user_account.role,
          "name": user_account.name,
          "surname": user_account.surname,
          "phone no": user_account.phone_no,
          "status": user_account.status,
        }