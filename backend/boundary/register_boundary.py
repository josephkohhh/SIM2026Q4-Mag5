# register_boundary.py - boundary for user registration

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db 
from schemas.register_schema import RegisterRequest, RegisterResponse
from control.register_control import register_useraccount


router = APIRouter()

# register endpoint 
@router.post("/register",response_model=RegisterResponse,status_code=status.HTTP_201_CREATED)
def register(register_data: RegisterRequest, db: Session = Depends(get_db)):

    try:
        # call to register user 
        user = register_useraccount(db, register_data)

        return RegisterResponse( 
            message = "Registered successfully!",
            name = user.name, 
            )

    except ValueError as error:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = str(error),
        ) from error

