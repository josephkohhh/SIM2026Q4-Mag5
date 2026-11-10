# get_all_project_control.py - handles retrieving all projects
from entity.project import ProjectEntity

# Controller responsible for handling the request to retrieve all projects
class GetAllProjectControl:

    # Initialise the entity object
    def __init__(self):
        self.project_entity = ProjectEntity()

    # Call the Entity method
    def get_all_projects(self):
        return self.project_entity.get_all()