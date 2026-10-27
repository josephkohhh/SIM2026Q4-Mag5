# delete_favorite_control.py - handles deleting a favorite item

from entity.favorite import FavoriteEntity


class DeleteFavoriteControl:

    # Initialise the entity object
    def __init__(self):
        self.favorite_entity = FavoriteEntity()

    # Call the Entity method
    def delete_favorite(self, favorite_id: int):
        return self.favorite_entity.delete(favorite_id)