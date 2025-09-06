from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RegistrationAuditOut(BaseModel):
    id: str
    user_id: str
    admin_id: str
    status: str
    reason: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True