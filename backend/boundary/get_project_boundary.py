# get_project_boundary.py - boundary for retrieving a project by name

from fastapi import APIRouter, HTTPException
from control.get_project_control import GetProjectControl

router = APIRouter()

# Call the controller
get_project_control = GetProjectControl()

# get category by code endpoint
@router.get("/get_project/{project_name}/{user_id}")
def get_idpcategory(project_name: str, user_id: int):
    try:
        return get_project_control.get_project(project_name, user_id)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error