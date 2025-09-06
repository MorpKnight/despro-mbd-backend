from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AttendanceCorrectionCreate(BaseModel):
    attendance_log_id: str
    reason: str

class AttendanceCorrectionOut(BaseModel):
    id: str
    attendance_log_id: str
    user_id: str
    requested_at: datetime
    reason: str
    status: str
    admin_id: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    review_note: Optional[str] = None

    class Config:
        from_attributes = True

class AttendanceCorrectionReview(BaseModel):
    approve: bool
    review_note: Optional[str] = None