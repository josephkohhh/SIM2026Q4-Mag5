# delete_project_boundary.py - boundary for ID to delete project

from fastapi import APIRouter, HTTPException
from control.delete_project_control import DeleteProjectControl

router = APIRouter()

# Initialise the controller object
delete_project_control = DeleteProjectControl()

# Delete category endpoint
@router.delete("/delete_project/{project_name}")
def delete_project(project_name: str):
    try:
        # Call the controller method
        return delete_project_control.delete_project(project_name)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error