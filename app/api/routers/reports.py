from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime, date

from app.db.session import get_db
from app.models import AttendanceLog, CateringLog, Feedback, EmergencyReport
from app.api.deps import require_roles

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/attendance-summary")
def attendance_summary(db: Session = Depends(get_db), user=Depends(require_roles("MASTERADMIN", "ADMIN"))):
    count = db.execute(select(func.count(AttendanceLog.id))).scalar()
    return {"total_attendance": count}

@router.get("/catering-summary")
def catering_summary(db: Session = Depends(get_db), user=Depends(require_roles("MASTERADMIN", "ADMIN"))):
    count = db.execute(select(func.count(CateringLog.id))).scalar()
    return {"total_catering": count}

@router.get("/feedback-summary")
def feedback_summary(db: Session = Depends(get_db), user=Depends(require_roles("MASTERADMIN", "ADMIN"))):
    avg_rating = db.execute(select(func.avg(Feedback.rating))).scalar()
    return {"average_rating": avg_rating}

@router.get("/emergency-summary")
def emergency_summary(db: Session = Depends(get_db), user=Depends(require_roles("MASTERADMIN", "ADMIN"))):
    count = db.execute(select(func.count(EmergencyReport.id))).scalar()
    return {"total_emergency_reports": count}
