# get_shortlistcount_control.py - handles retrieving shortlist count

from entity.favorite import FavoriteEntity


class GetShortlistCountControl:

    # Initialise the entity object
    def __init__(self):
        self.shortlistcount_entity = FavoriteEntity()

    # Call the Entity method
    def get_shortlistcount(self, project_id: int):
        return self.shortlistcount_entity.get_count(project_id)

