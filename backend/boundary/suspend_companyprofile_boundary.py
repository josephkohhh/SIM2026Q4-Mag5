# suspend_companyprofile_boundary.py - boundary for suspending a company profile

from fastapi import APIRouter, HTTPException
from control.suspend_companyprofile_control import SuspendCompanyProfileControl

router = APIRouter()

# Initialise the controller object
suspend_companyprofile_control = SuspendCompanyProfileControl()

# suspend companyprofile endpoint
@router.patch("/suspend_companyprofile/{user_id}")
def suspend_companyprofile(user_id: int):
    try:
        # Call the controller method
        return suspend_companyprofile_control.suspend_companyprofile(user_id)

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
