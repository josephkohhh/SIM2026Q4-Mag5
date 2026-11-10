# suspend_useraccount_boundary.py - boundary for suspending a user account

from fastapi import APIRouter, HTTPException
from control.suspend_useraccount_control import SuspendUserAccountControl

router = APIRouter()

# Initialise the controller object
suspend_useraccount_control = SuspendUserAccountControl()

# suspend useraccount endpoint
@router.patch("/suspend_useraccount/{email}")
def suspend_useraccount(email: str):
    try:
        # Call the controller method
        return suspend_useraccount_control.suspend_useraccount(email)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        ) from error
