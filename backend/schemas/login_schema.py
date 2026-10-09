# login_schema.py - defines what the user is allowed to send during login

from pydantic import BaseModel, EmailStr

# Any class that inherits from BaseModel is a Pydantic data model/schema
# It gets validation, parsing, and serialization functionality from Pydantic
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel): # The fields that user recieves if succeed
    message: str
    name: str
    role: str

