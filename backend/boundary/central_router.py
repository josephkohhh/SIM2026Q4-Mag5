# central_router.py - house all the routes

from fastapi import APIRouter

from boundary.register_boundary import router as register_router
from boundary.login_boundary import router as login_router
from boundary.logout_boundary import router as logout_router

from boundary.createuseraccount_boundary import router as createuseraccount_router
from boundary.updateuseraccount_boundary import router as updateuseraccount_router
from boundary.getuseraccount_boundary import router as getuseraccountbyid_router
from boundary.suspenduseraccount_boundary import router as suspenduseraccountbyid_router

from boundary.createuserprofile_boundary import router as createuserprofile_router
from boundary.updateuserprofile_boundary import router as updateuserprofile_router
from boundary.deleteuserprofile_boundary import router as deleteuserprofile_router
from boundary.getalluserprofile_boundary import router as getalluserprofile_router


router = APIRouter()

# register & login/logout
router.include_router(register_router)
router.include_router(login_router)
router.include_router(logout_router)

# user account
router.include_router(createuseraccount_router)
router.include_router(updateuseraccount_router)
router.include_router(getuseraccountbyid_router)
router.include_router(suspenduseraccountbyid_router)

# user profile
router.include_router(createuserprofile_router)
router.include_router(updateuserprofile_router)
router.include_router(deleteuserprofile_router)
router.include_router(getalluserprofile_router)







