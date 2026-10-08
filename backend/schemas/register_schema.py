# register_schema.py - defines what the user is allowed to send during registration

from enum import Enum
from pydantic import BaseModel, EmailStr

class RegisterRole(str, Enum):
    CUSTOMER = "CUSTOMER"
    INTERIOR_DESIGNER = "INTERIOR DESIGNER"


# Any class that inherits from BaseModel is a Pydantic data model/schema
# It gets validation, parsing, and serialization functionality from Pydantic
class RegisterRequest(BaseModel): # The fields that user requested
    email: EmailStr
    password: str
    role: RegisterRole
    name: str
    surname: str
    phone_no: str


class RegisterResponse(BaseModel): # The fields that user recieves if succeed
     message: str 
     name: str 

