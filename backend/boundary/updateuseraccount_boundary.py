# updateuseraccount_boundary.py - boundary for admin to update user account

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.updateuseraccount_schema import (
    UpdateUserAccountRequest,
    UpdateUserAccountResponse
)
from control.updateuseraccount_control import UpdateUserAccountControl

router = APIRouter()

# update user account endpoint
@router.patch(
    "/updateuseraccount/{email}",
    response_model=UpdateUserAccountResponse,
    status_code=status.HTTP_200_OK
)
def update(
    email: str,
    update_data: UpdateUserAccountRequest,
    db: Session = Depends(get_db)
):
    # Create the Control and provide the database session
    control = UpdateUserAccountControl(db)

    try:
        # Pass user data to the Control
        user = control.execute(email, update_data)

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
