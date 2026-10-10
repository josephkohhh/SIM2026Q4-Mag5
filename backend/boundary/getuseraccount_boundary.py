# getuseraccount_boundary.py - boundary for viewing a user account

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.getuseraccount_schema import GetUserAccountResponse
from control.getuseraccount_control import get_useraccount_by_id


router = APIRouter()


# Get user account by ID
@router.get(
    "/useraccount/{user_id}",
    response_model=GetUserAccountResponse,
    status_code=status.HTTP_200_OK
)
def get_useraccount(
    user_id: int,
    db: Session = Depends(get_db)
):
    try:
        # Call control to retrieve account
        user = get_useraccount_by_id(db, user_id)

        return user

    except LookupError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        ) from error
