# create_project_boundary.py - boundary for ID to create project

from fastapi import APIRouter, HTTPException
from control.create_project_control import CreateProjectControl

router = APIRouter()

# Initialise the controller object
create_project_control = CreateProjectControl()

# Create project endpoint
@router.post("/create_project")
def create_project(project_data: dict):
        
    try:
        # Call the controller method
        return create_project_control.create_project(project_data)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        ) from error