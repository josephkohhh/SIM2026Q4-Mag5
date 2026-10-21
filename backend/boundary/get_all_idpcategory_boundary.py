# get_idpcategory_boundary.py - Boundary to get all categories

from fastapi import APIRouter
from control.get_all_idpcategory_control import GetAllIdpCategoryControl


router = APIRouter()

# Initialise the controller object
get_all_idpcategory_control = GetAllIdpCategoryControl() 

# get all categories endpoint
@router.get("/get_all_idpcategory")
def get_all_idpcategories():

        # Call the controller method
        categories = get_all_idpcategory_control.get_all()

        return [
            {
                "category_id": category.category_id,
                "category_code": category.category_code,
                "description": category.description
            }
            for category in categories
        ]
