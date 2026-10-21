# delete_idpcategory_control.py - handles deleting a category

from entity.idpcategory import IdpCategoryEntity


class DeleteIdpCategoryControl:

    # Initialise the entity object
    def __init__(self):
        self.idpcategory_entity = IdpCategoryEntity()

    # Call the Entity method
    def delete_idpcategory(self, category_code: str):
        return self.idpcategory_entity.delete(category_code)