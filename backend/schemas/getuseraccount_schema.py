# getuseraccount_schema.py - response schema for viewing a user account

from datetime import datetime
from pydantic import BaseModel, ConfigDict
from entity.useraccount import RoleEnum, StatusEnum


class GetUserAccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    email: str
    role: RoleEnum
    name: str
    surname: str
    phone_no: str
    status: StatusEnum
    created_at: datetime
    updated_at: datetime
