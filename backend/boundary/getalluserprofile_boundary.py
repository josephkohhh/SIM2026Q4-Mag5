# getalluserprofile_boundary.py - Boundary to get all user profiles

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from schemas.getalluserprofile_schema import UserProfileResponse
from control.getalluserprofile_control import GetAllUserProfileControl

router = APIRouter()

# get all user profiles endpoint
@router.get(
    "/getalluserprofile",
    response_model=List[UserProfileResponse],
    status_code=status.HTTP_200_OK
)
def getalluserprofile(db: Session = Depends(get_db)):
    # Create the Control and provide the database session
    control = GetAllUserProfileControl(db)


    return control.execute()