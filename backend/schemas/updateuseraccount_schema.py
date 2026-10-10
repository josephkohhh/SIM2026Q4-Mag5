
# updateuseraccount_schema.py

from enum import Enum
from typing import Optional
from pydantic import BaseModel


class UpdateRole(str, Enum):
    CUSTOMER = "CUSTOMER"
    INTERIOR_DESIGNER = "INTERIOR DESIGNER"
    ADMIN = "ADMIN"
    PLATFORM_MANAGEMENT = "PLATFORM MANAGEMENT"

class StatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class UpdateUserAccountRequest(BaseModel):
    password: Optional[str] = None
    role: Optional[UpdateRole] = None
    name: Optional[str] = None
    surname: Optional[str] = None
    phone_no: Optional[str] = None
    status: Optional[str] = None


class UpdateUserAccountResponse(BaseModel):
    message: str
