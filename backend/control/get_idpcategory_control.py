# get_idpcategory_control.py - handles retrieving a category by code

from entity.idpcategory import IdpCategoryEntity


class GetIdpCategoryControl:

    # Initialise the entity object
    def __init__(self):
        self.idpcategory_entity = IdpCategoryEntity()

    # Call the Entity method
    def get_idpcategory(self, category_code: str):
        return self.idpcategory_entity.get_by_category_code(category_code)
