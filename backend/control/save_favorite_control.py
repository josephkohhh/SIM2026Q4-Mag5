# save_favorite_control.py - handles saving a project to favorite

from entity.favorite import FavoriteEntity


class SaveFavoriteControl:

    # Initialise the entity object
    def __init__(self):
        self.favorite_entity = FavoriteEntity()

    # Call the Entity method
    def save_favorite(self, user_id: int, project_id: int):
        return self.favorite_entity.save(user_id, project_id)