# update_project_control.py - handles project updates

from entity.project import ProjectEntity


class UpdateProjectControl:

    # Initializes the entity object
    def __init__(self):
        self.project_entity = ProjectEntity()

    # Call the Entity method
    def update_project(self, project_name: str, update_data: dict):
        return self.project_entity.update(project_name, update_data)


    