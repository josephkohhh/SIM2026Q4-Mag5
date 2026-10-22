# delete_idpcategory_boundary.py - boundary for admin to delete category

from fastapi import APIRouter, HTTPException
from control.delete_idpcategory_control import DeleteIdpCategoryControl

router = APIRouter()

# Initialise the controller object
delete_idpcategory_control = DeleteIdpCategoryControl()

# Delete category endpoint
@router.delete("/delete_category/{category_code}")
def delete_idpcategory(category_code: str):
    try:
        # Call the controller method
        return delete_idpcategory_control.delete_idpcategory(category_code)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error