# get_all_favorite_boundary.py - Boundary to get all projects saved in favorites

from fastapi import APIRouter
from control.get_all_favorite_control import GetAllFavoriteControl


router = APIRouter()

# Initialise the controller object
get_all_favorite_control = GetAllFavoriteControl() 

# get all favorites endpoint
@router.get("/get_all_favorite/{user_id}")
def get_all_favorites(user_id: int):

        # Call the controller method
        return get_all_favorite_control.get_all_favorites(user_id)
        
