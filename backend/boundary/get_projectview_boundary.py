# get_projectview_boundary.py - boundary for retrieving project views

from fastapi import APIRouter, HTTPException
from control.get_projectview_control import GetProjectViewControl

router = APIRouter()

# Call the controller
get_projectview_control = GetProjectViewControl()

# get project view by project id 
@router.get("/get_projectview/{project_id}")
def get_projectview(project_id: int):
    try:
        return get_projectview_control.get_projectview(project_id)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error