# register_boundary.py - handles user registration requests and HTTP responses

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from control.register_control import RegisterControl
from schemas.register_schema import RegisterRequest

router = APIRouter()

# Register endpoint
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
    register_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    # Create the Control and provide the database session
    control = RegisterControl(db)

    try:
        # Pass registration info to the Control
        user = control.execute(register_data)
        return {
            "message": f"User account {user.name} created successfully"
        }
    
     # Convert registration errors into an HTTP 400 response
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error