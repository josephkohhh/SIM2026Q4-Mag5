# update_useraccount_boundary.py - boundary for admin to update user account

from fastapi import APIRouter, HTTPException
from control.update_useraccount_control import UpdateUserAccountControl

router = APIRouter()

# Initialise the controller object
update_useraccount_control = UpdateUserAccountControl()

# update user profile endpoint
@router.patch("/update_useraccount")
def update_useraccount(email: str,update_data: dict):

    try:
        # Call the controller method
         return update_useraccount_control.update_useraccount(email,update_data)
    
    except LookupError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
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
