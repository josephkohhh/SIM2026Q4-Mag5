# suspenduseraccount_schema.py 

from pydantic import BaseModel
from entity.useraccount import StatusEnum


class SuspendUserAccountResponse(BaseModel):
    message: str
    user_id: int
    status: StatusEnum
