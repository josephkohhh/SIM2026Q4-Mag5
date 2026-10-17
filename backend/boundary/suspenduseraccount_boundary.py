# suspenduseraccount_boundary.py - boundary for suspending a user account

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.suspenduseraccount_schema import SuspendUserAccountResponse
from control.suspenduseraccount_control import SuspendUserAccountControl

router = APIRouter()

# suspend user account endpoint
@router.patch(
    "/suspenduseraccount/{user_email}",
    response_model=SuspendUserAccountResponse,
    status_code=status.HTTP_200_OK
)
def suspend(email: str, db: Session = Depends(get_db)):
    # Create the Control and provide the database session
    control = SuspendUserAccountControl(db)

    try:
        # Pass user email to the Control
        user = control.execute(email)

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
