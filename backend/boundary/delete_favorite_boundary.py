# delete_favorite_boundary.py - boundary for customer to delete favorite

from fastapi import APIRouter, HTTPException
from control.delete_favorite_control import DeleteFavoriteControl

router = APIRouter()

# Initialise the controller object
delete_favorite_control = DeleteFavoriteControl()

# Delete category endpoint
@router.delete("/delete_favorite/{favorite_id}")
def delete_favorite(favorite_id: int):
    try:
        # Call the controller method
        return delete_favorite_control.delete_favorite(favorite_id)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error