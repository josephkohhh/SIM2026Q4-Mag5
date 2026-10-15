# getalluserprofile_boundary.py - Boundary to get all user profiles

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from schemas.getalluserprofile_schema import UserProfileResponse
from control.getalluserprofile_control import get_all_userprofiles

router = APIRouter()


@router.get(
    "/getalluserprofile",
    response_model=List[UserProfileResponse],
    status_code=status.HTTP_200_OK
)
def getalluserprofile(db: Session = Depends(get_db)):

    # Call control to retrieve all user profiles
    userprofiles = get_all_userprofiles(db)

    return userprofiles
