# updateuserprofile_schema.py

from typing import Optional
from pydantic import BaseModel


class UpdateUserProfileRequest(BaseModel):
    role: Optional[str] = None
    description: Optional[str] = None

class UpdateUserProfileResponse(BaseModel):
    message: str
