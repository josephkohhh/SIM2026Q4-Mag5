# get_companyprofile_boundary.py - boundary for retrieving a companyprofile by user_id

from fastapi import APIRouter, HTTPException
from control.get_companyprofile_control import GetCompanyProfileControl

router = APIRouter()

# Call the controller
get_companyprofile_control = GetCompanyProfileControl()

# get companyprofile by code endpoint
@router.get("/get_companyprofile/{user_id}")
def get_companyprofile(user_id: int):
    try:
        return get_companyprofile_control.get_companyprofile(user_id)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error