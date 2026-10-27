# save_favorite_boundary.py - boundary for customer to save a project

from fastapi import APIRouter, HTTPException
from control.save_favorite_control import SaveFavoriteControl

router = APIRouter()

# Initialise the controller object
save_favorite_control = SaveFavoriteControl()

# Save favorite endpoint
@router.post("/save_favorite")
def save_favorite(favorite_data: dict):
        
    try:
       # Call the controller method
       return save_favorite_control.save_favorite(favorite_data)
    
    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error
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