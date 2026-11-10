# delete_project_control.py - handles deleting a project

from entity.project import ProjectEntity


class DeleteProjectControl:

    # Initialise the entity object
    def __init__(self):
        self.project_entity = ProjectEntity()

    # Call the Entity method
    def delete_project(self, project_name: str):
        return self.project_entity.delete(project_name)