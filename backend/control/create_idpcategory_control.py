# create_idpcategory_control.py - handles creating a category

from entity.idpcategory import IdpCategoryEntity


class CreateIdpCategoryControl:

    # Initialise the entity object
    def __init__(self):
        self.idpcategory_entity = IdpCategoryEntity()

    # Call the Entity method
    def create_idpcategory(self, category_data: dict):
        return self.idpcategory_entity.create(category_data)
