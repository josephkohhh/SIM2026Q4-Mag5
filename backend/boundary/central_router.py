# central_router.py - house all the routes

from fastapi import APIRouter

from boundary.register_boundary import router as register_router
from boundary.login_boundary import router as login_router
from boundary.logout_boundary import router as logout_router
from boundary.createuseraccount_boundary import router as createuseraccount_router
from boundary.updateuseraccount_boundary import router as updateuseraccount_router
from boundary.getuseraccount_boundary import router as getuseraccountbyid_router
from boundary.suspenduseraccount_boundary import router as suspenduseraccountbyid_router



router = APIRouter()

router.include_router(register_router)
router.include_router(login_router)
router.include_router(logout_router)
router.include_router(createuseraccount_router)
router.include_router(updateuseraccount_router)
router.include_router(getuseraccountbyid_router)
router.include_router(suspenduseraccountbyid_router)



