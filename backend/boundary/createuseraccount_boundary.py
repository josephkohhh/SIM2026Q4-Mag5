# createuseraccount_boundary.py - boundary for admin to create user account

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db 
from schemas.createuseraccount_schema import CreateUserAccountRequest, CreateUserAccountResponse
from control.createuseraccount_control import create_useraccount


router = APIRouter()

# create user account endpoint 
@router.post("/createuseraccount",response_model=CreateUserAccountResponse,status_code=status.HTTP_201_CREATED)
def register(register_data: CreateUserAccountRequest, db: Session = Depends(get_db)):

    try:
        # call to register user 
        user = create_useraccount(db, register_data)

        return CreateUserAccountResponse( 
            message = f"{user.name} registered successfully with role of {user.role.value}",
            )

    except ValueError as error:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = str(error),
        ) from error

