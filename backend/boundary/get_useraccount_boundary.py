# get_useraccount_boundary.py - boundary for viewing a user account

from fastapi import APIRouter, Depends, HTTPException
from control.get_useraccount_control import GetUserAccountControl

router = APIRouter()

# Initialise the controller object
get_useraccount_control = GetUserAccountControl()

# get user account endpint
@router.get("/get_useracount/{user_email}")
def get_useraccount(email: str):
    try:
        return get_useraccount_control.get_by_email(email)

    except LookupError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error
