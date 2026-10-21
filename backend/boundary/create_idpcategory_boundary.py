# create_idpcategory_boundary.py - boundary for admin to create category

from fastapi import APIRouter, HTTPException
from control.create_idpcategory_control import CreateIdpCategoryControl

router = APIRouter()

# Initialise the controller object
create_idpcategory_control = CreateIdpCategoryControl()

# Create category endpoint
@router.post("/create_idpcategory")
def create_idpcategory(category_data: dict):
        
    try:
        # Call the controller method
        return create_idpcategory_control.create_idpcategory(category_data)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        ) from error