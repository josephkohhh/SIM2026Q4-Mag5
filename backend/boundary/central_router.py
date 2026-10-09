# central_router.py - house all the routes

from fastapi import APIRouter

from boundary.register_boundary import router as register_router
from boundary.login_boundary import router as login_router
from boundary.logout_boundary import router as logout_router
from boundary.profile_boundary import router as profile_router


router = APIRouter()

router.include_router(register_router)
router.include_router(login_router)
router.include_router(logout_router)
router.include_router(profile_router)
