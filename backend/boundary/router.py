# router.py - central router (house all routes)

from fastapi import APIRouter

from boundary.register_boundary import router as register_router
from boundary.login_boundary import router as login_router

router = APIRouter()

router.include_router(register_router)
router.include_router(login_router)