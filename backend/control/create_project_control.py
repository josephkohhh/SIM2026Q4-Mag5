# create_project_control.py - handles creating a project

from entity.project import ProjectEntity


class CreateProjectControl:

    # Initialise the entity object
    def __init__(self):
        self.project_entity = ProjectEntity()

    # Call the Entity method
    def create_project(self, project_data: dict):
        return self.project_entity.create(project_data)
