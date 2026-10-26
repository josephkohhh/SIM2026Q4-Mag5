# get_project_control.py - handles retrieving a project by name

from entity.project import ProjectEntity


class GetProjectControl:

    # Initialise the entity object
    def __init__(self):
        self.project_entity = ProjectEntity()

    # Call the Entity method
    def get_project(self, project_name: str):
        return self.project_entity.get_by_name(project_name)
