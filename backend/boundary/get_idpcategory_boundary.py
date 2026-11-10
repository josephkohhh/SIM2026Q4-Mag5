# get_idpcategory_boundary.py - boundary for retrieving a category by code

from fastapi import APIRouter, HTTPException
from control.get_idpcategory_control import GetIdpCategoryControl

router = APIRouter()

# Call the controller
get_idpcategory_control = GetIdpCategoryControl()

# get category by code endpoint
@router.get("/get_idpcategory/{category_code}")
def get_idpcategory(category_code: str):
    try:
        return get_idpcategory_control.get_idpcategory(category_code)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error