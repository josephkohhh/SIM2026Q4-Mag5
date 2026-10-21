# update_idpcategory_control.py - handles category updates

from entity.idpcategory import IdpCategoryEntity


class UpdateIdpCategoryControl:

    # Initializes the entity object
    def __init__(self):
        self.idpcategory_entity = IdpCategoryEntity()

    # Call the Entity method
    def update_idpcategory(self, category_code: str, update_data: dict):
        return self.idpcategory_entity.update(category_code, update_data)


    