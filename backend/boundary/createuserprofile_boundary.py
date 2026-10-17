# createuserprofile_boundary.py - boundary for admin to create user profile

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.createuserprofile_schema import (
    CreateUserProfileRequest,
    CreateUserProfileResponse
)
from control.createuserprofile_control import CreateUserProfileControl

router = APIRouter()

# create user profile endpoint
@router.post(
    "/createuserprofile",
    response_model=CreateUserProfileResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user_profile(
    userprofile_data: CreateUserProfileRequest,
    db: Session = Depends(get_db)
):
    # Create the Control and provide the database session
    control = CreateUserProfileControl(db)

    try:
         # Pass userprofile info to the Control
        userprofile = control.execute(userprofile_data)

        return CreateUserProfileResponse(
            message=f"Role {userprofile.role} created successfully"
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        ) from error
