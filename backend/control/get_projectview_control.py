# get_projectview_control.py - handles retrieving project view

from entity.projectview import ProjectViewEntity


class GetProjectViewControl:

    # Initialise the entity object
    def __init__(self):
        self.projectview_entity = ProjectViewEntity()

    # Call the Entity method
    def get_projectview(self, project_id: int):
        return self.projectview_entity.get_viewcount(project_id)

