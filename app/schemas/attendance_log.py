from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AttendanceLogOut(BaseModel):
    id: str
    timestamp: datetime
    syncTimestamp: Optional[datetime] = None
    UserId: str
    SchoolId: str

    class Config:
        from_attributes = True