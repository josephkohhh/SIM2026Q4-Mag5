# update_idpcategory_boundary.py - boundary for admin to update category

from fastapi import APIRouter, HTTPException
from control.update_idpcategory_control import UpdateIdpCategoryControl

router = APIRouter()

# Initialise the controller object
update_idpcategory_control = UpdateIdpCategoryControl()

# Update category endpoint
@router.patch("/update_idpcategory")
def update_idpcategory(category_code: str,update_data: dict):

    try:
        # Call the controller method
         return update_idpcategory_control.update_idpcategory(category_code,update_data)

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
