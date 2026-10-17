# getuserprofile_boundary.py - boundary for getting a user profile

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.getuserprofile_schema import UserProfileResponse
from control.getuserprofile_control import GetUserProfileControl

router = APIRouter()

# get a user profile endpoint 
@router.get(
    "/getuserprofile/{profile_id}",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK
)
def getuserprofile(
    profile_id: int,
    db: Session = Depends(get_db)
):
    # Create the Control and provide the database session
    control = GetUserProfileControl(db)

    try:
        return control.execute(profile_id)

    except LookupError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        ) from error
