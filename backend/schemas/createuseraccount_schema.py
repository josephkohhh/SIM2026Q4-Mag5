# createuseraccount_schema.py - defines what the user that admin can create

from enum import Enum
from pydantic import BaseModel, EmailStr

class CreateRole(str, Enum):
    CUSTOMER = "CUSTOMER"
    INTERIOR_DESIGNER = "INTERIOR DESIGNER"
    ADMIN = "ADMIN"
    PLATFORM_MANAGEMENT = "PLATFORM MANAGEMENT"


# Any class that inherits from BaseModel is a Pydantic data model/schema
# It gets validation, parsing, and serialization functionality from Pydantic
class CreateUserAccountRequest(BaseModel): # The fields that user requested
    email: EmailStr
    password: str
    role: CreateRole
    name: str
    surname: str
    phone_no: str


class CreateUserAccountResponse(BaseModel): # The fields that user recieves if succeed
     message: str 

