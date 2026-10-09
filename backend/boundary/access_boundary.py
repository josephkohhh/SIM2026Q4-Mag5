# access_boundary.py - protected endpoints

from fastapi import APIRouter, Depends
from control.access_control import require_role

router = APIRouter()


@router.get("/admin/dashboard")
def admin_dashboard(
    user=Depends(require_role("admin")),
):
    return {"message": "Welcome to the admin dashboard"}


@router.get("/customer/dashboard")
def customer_dashboard(
    user=Depends(require_role("customer")),
):
    return {"message": "Welcome to the customer dashboard"}