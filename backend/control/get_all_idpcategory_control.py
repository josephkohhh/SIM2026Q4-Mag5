# get_all_idpcategory_control.py - handles retrieving all categories

from entity.idpcategory import IdpCategoryEntity

# Controller responsible for handling the request to retrieve all categories
class GetAllIdpCategoryControl:

    # Initialise the entity object
    def __init__(self):
        self.idpcategory_entity = IdpCategoryEntity()

    # Call the Entity method
    def get_all_idpcategories(self):
        return self.idpcategory_entity.get_all()