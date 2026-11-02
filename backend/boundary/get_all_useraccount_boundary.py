# get_all_useraccount_boundary.py - Boundary to get all projects

from fastapi import APIRouter
from control.get_all_useraccount_control import GetAllUserAccountControl


router = APIRouter()

# Initialise the controller object
get_all_useraccount_control = GetAllUserAccountControl() 

# get all projects endpoint
@router.get("/get_all_user")
def get_all_user_accounts():

        # Call the controller method
        return get_all_useraccount_control.get_all_user_accounts()

