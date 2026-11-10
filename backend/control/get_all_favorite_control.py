# get_all_favorite_control.py - handles retrieving all proejects saved in favorite

from entity.favorite import FavoriteEntity

class GetAllFavoriteControl:

    # Initialise the entity object
    def __init__(self):
        self.favorite_entity = FavoriteEntity()

    # Call the Entity method
    def get_all_favorites(self, user_id: int):
        return self.favorite_entity.get_all(user_id)