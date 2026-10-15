
# updateuserprofile_boundary.py - Boundary for admin to update user profile

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.updateuserprofile_schema import (
    UpdateUserProfileRequest,
    UpdateUserProfileResponse
)
from control.updateuserprofile_control import update_userprofile

router = APIRouter()


# Update user profile endpoint
@router.patch(
    "/updateuserprofile/{profile_id}",
    response_model=UpdateUserProfileResponse,
    status_code=status.HTTP_200_OK
)
def updateuserprofile(
    profile_id: int,
    update_data: UpdateUserProfileRequest,
    db: Session = Depends(get_db)
):
    try:
        # Call control to update user profile
        update_userprofile(db, profile_id, update_data)

        return UpdateUserProfileResponse(
            message="User profile updated successfully"
        )

    except LookupError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        ) from error

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        ) from error
