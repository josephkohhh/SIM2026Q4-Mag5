# deleteuserprofile_schema.py - Defines delete user profile response

from pydantic import BaseModel


class DeleteUserProfileResponse(BaseModel):
    message: str
