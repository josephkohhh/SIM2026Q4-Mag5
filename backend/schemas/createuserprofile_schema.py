# createuserprofile_schema.py - defines user profile fields

from pydantic import BaseModel

# Any class that inherits from BaseModel is a Pydantic data model/schema
# It gets validation, parsing, and serialization functionality from Pydantic
class CreateUserProfileRequest(BaseModel): # The fields for user profile 
    role: str
    description: str

class CreateUserProfileResponse(BaseModel): # The fields that user admin recieves if succeed
     message: str 

