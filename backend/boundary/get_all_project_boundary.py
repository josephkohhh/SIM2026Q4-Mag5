# get_all_project_boundary.py - Boundary to get all projects

from fastapi import APIRouter
from control.get_all_project_control import GetAllProjectControl


router = APIRouter()

# Initialise the controller object
get_all_project_control = GetAllProjectControl() 

# get all projects endpoint
@router.get("/get_all_project")
def get_all_projects():

        # Call the controller method
        return get_all_project_control.get_all_projects()

