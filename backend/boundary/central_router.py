# central_router.py - house all the routes

from fastapi import APIRouter

from boundary.register_boundary import router as register_router
from boundary.login_boundary import router as login_router
from boundary.logout_boundary import router as logout_router

from boundary.create_useraccount_boundary import router as create_useraccount_router
from boundary.update_useraccount_boundary import router as update_useraccount_router
from boundary.get_useraccount_boundary import router as get_useraccount_router
from boundary.suspend_useraccount_boundary import router as suspend_useraccount_router

from boundary.create_userprofile_boundary import router as create_userprofile_router
from boundary.update_userprofile_boundary import router as update_userprofile_router
from boundary.delete_userprofile_boundary import router as delete_userprofile_router
from boundary.get_all_userprofile_boundary import router as get_all_userprofile_router
from boundary.get_userprofile_boundary import router as get_userprofile_router

from boundary.create_idpcategory_boundary import router as create_idpcategory_router
from boundary.update_idpcategory_boundary import router as update_idpcategory_router
from boundary.delete_idpcategory_boundary import router as delete_idpcategory_router
from boundary.get_all_idpcategory_boundary import router as get_all_idpcategory_router
from boundary.get_idpcategory_boundary import router as get_idpcategory_router

router = APIRouter()

# register & login/logout
router.include_router(register_router)
router.include_router(login_router)
router.include_router(logout_router)

# user account
router.include_router(get_useraccount_router)
router.include_router(create_useraccount_router)
router.include_router(update_useraccount_router)
router.include_router(suspend_useraccount_router)

# user profile
router.include_router(get_userprofile_router)
router.include_router(get_all_userprofile_router)
router.include_router(create_userprofile_router)
router.include_router(update_userprofile_router)
router.include_router(delete_userprofile_router)

# idp category
router.include_router(create_idpcategory_router)
router.include_router(update_idpcategory_router)
router.include_router(delete_idpcategory_router)
router.include_router(get_all_idpcategory_router)
router.include_router(get_idpcategory_router)






