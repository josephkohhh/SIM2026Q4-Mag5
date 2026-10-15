
# deleteuserprofile_boundary.py - Boundary for deleting a user profile

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.deleteuserprofile_schema import DeleteUserProfileResponse
from control.deleteuserprofile_control import delete_userprofile

router = APIRouter()


@router.delete(
    "/deleteuserprofile/{profile_id}",
    response_model=DeleteUserProfileResponse,
    status_code=status.HTTP_200_OK
)
def deleteuserprofile(
    profile_id: int,
    db: Session = Depends(get_db)
):
    try:
        # Call control to delete user profile
        delete_userprofile(db, profile_id)

        return DeleteUserProfileResponse(
            message=f"User profile deleted successfully"
        )

    except LookupError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        ) from error
