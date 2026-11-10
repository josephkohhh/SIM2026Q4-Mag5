# update_project_boundary.py - boundary for ID to update project

from fastapi import APIRouter, HTTPException
from control.update_project_control import UpdateProjectControl

router = APIRouter()

# Initialise the controller object
update_project_control = UpdateProjectControl()

# Update category endpoint
@router.patch("/update_project")
def update_project(project_name: str, updates: dict):
     
    try:
        # Call the controller method
        return update_project_control.update_project(project_name, updates)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error



