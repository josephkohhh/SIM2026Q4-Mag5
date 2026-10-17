# getuseraccount_boundary.py - boundary for viewing a user account

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.getuseraccount_schema import GetUserAccountResponse
from control.getuseraccount_control import GetUserAccountControl

router = APIRouter()

# get user_id endpint
@router.get(
    "/useraccount/{user_email}",
    response_model=GetUserAccountResponse,
    status_code=status.HTTP_200_OK
)
def get_useraccount(
    email: str,
    db: Session = Depends(get_db)
):
    # Create the Control and provide the database session
    control = GetUserAccountControl(db)

    try:
        # Pass user email to the Control
        user = control.execute(email)
        return user

    except LookupError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        ) from error
