
# suspenduseraccount_boundary.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.suspenduseraccount_schema import SuspendUserAccountResponse
from control.suspenduseraccount_control import suspend_useraccount


router = APIRouter()


@router.patch(
    "/suspenduseraccount/{user_id}",
    response_model=SuspendUserAccountResponse,
    status_code=status.HTTP_200_OK
)
def suspend(
    user_id: int,
    db: Session = Depends(get_db)
):
    try:
        # Call control to suspend account
        user = suspend_useraccount(db, user_id)

        return SuspendUserAccountResponse(
            message=f"User account {user.name} has been suspended successfully",
            user_id=user.user_id,
            status=user.status
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
