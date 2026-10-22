# update_companyprofile_boundary.py - boundary for ID to update company profile

from fastapi import APIRouter, HTTPException
from control.update_companyprofile_control import UpdateCompanyProfileControl

router = APIRouter()

# Initialise the controller object
update_companyprofile_control = UpdateCompanyProfileControl()

# Update companyprofile endpoint
@router.patch("/update_companyprofile")
def update_companyprofile(user_id: int, update_data: dict):

    try:
        # Call the controller method
         return update_companyprofile_control.update_companyprofile(user_id,update_data)
    
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
