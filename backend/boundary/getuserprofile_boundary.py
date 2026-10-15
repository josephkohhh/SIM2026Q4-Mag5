# getuserprofile_boundary.py - Boundary to get a user profile

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.getuserprofile_schema import UserProfileResponse
from control.getuserprofile_control import get_userprofile

router = APIRouter()

@router.get("/getuserprofile/{profile_id}", response_model=UserProfileResponse)
def getuserprofile(profile_id: int, db: Session = Depends(get_db)):
    userprofile = get_userprofile(db, profile_id)

    if userprofile is None:
        raise HTTPException(
            status_code=404,
            detail="User profile not found"
        )

    return userprofile