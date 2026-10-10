# updateuseraccount_boundary.py - boundary for admin to update user account

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.updateuseraccount_schema import (
    UpdateUserAccountRequest,
    UpdateUserAccountResponse
)
from control.updateuseraccount_control import update_useraccount

router = APIRouter()

# Update user account endpoint
@router.patch(
    "/updateuseraccount/{user_id}",
    response_model=UpdateUserAccountResponse,
    status_code=status.HTTP_200_OK
)
def update(
    user_id: int,
    update_data: UpdateUserAccountRequest,
    db: Session = Depends(get_db)
):
    try:
        # Call control to update user account
        user = update_useraccount(db, user_id, update_data)

        return UpdateUserAccountResponse(
            message=(
                f"User account {user.name} updated successfully "
                f"with role of {user.role.value}"
            )
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
