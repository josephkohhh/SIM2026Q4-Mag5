
# getuserprofile_schema.py - Schema for retrieving a user profile

from pydantic import BaseModel, ConfigDict


class UserProfileResponse(BaseModel):
    profile_id: int
    role: str
    description: str

    # from_attributes=True allows Pydantic to serialize SQLAlchemy model obj into JSON responses
    model_config = ConfigDict(from_attributes=True) 
