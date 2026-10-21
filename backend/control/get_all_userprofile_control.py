# get_all_userprofile_control.py - handles retrieving all user profiles

from entity.userprofile import UserProfileEntity

# Controller responsible for handling the request to retrieve all user profiles 
class GetAllUserProfileControl:

    # Initialise the entity object
    def __init__(self):
        self.userprofile_entity = UserProfileEntity()

    # Call the Entity method
    def get_all(self):
        return self.userprofile_entity.get_all()