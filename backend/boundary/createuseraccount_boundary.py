# createuseraccount_boundary.py - boundary for admin to create user account

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.createuseraccount_schema import CreateUserAccountRequest, CreateUserAccountResponse
from control.createuseraccount_control import CreateUserAccountControl

router = APIRouter()

# create user account endpoint
@router.post(
    "/createuseraccount",
    response_model=CreateUserAccountResponse,
    status_code=status.HTTP_201_CREATED
)
def create_useraccount(
    user_data: CreateUserAccountRequest,
    db: Session = Depends(get_db)
):
    # Create the Control and provide the database session
    control = CreateUserAccountControl(db)

    try:
        # Pass user info to the Control
        user = control.execute(user_data)

        return CreateUserAccountResponse(
            message=f"{user.name} registered successfully with role of {user.role.value}"
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        ) from error