# create_companyprofile_boundary.py - boundary for ID to create company profile

from fastapi import APIRouter, HTTPException
from control.create_companyprofile_control import CreateCompanyProfileControl

router = APIRouter()

# Initialise the controller object
create_companyprofile_control = CreateCompanyProfileControl()

# Create company profile endpoint
@router.post("/create_companyprofile")
def create_companyprofile(company_data: dict):
        
    try:
        # Call the controller method
        return create_companyprofile_control.create_companyprofile(company_data)

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