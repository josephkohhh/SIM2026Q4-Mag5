# get_shortlistcount_boundary.py - boundary for retrieving shortlist count

from fastapi import APIRouter, HTTPException
from control.get_shortlistcount_control import GetShortlistCountControl

router = APIRouter()

# Call the controller
get_shortlistcount_control = GetShortlistCountControl()

# get shortlist count by project id 
@router.get("/get_shortlistcount/{project_id}")
def get_shortlistcount(project_id: int):
    try:
        return get_shortlistcount_control.get_shortlistcount(project_id)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error