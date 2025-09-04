from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.db.session import get_db
from app.models import User, School, AttendanceLog, CateringLog, Feedback, EmergencyReport
from app.api.deps import require_roles

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db), user=Depends(require_roles("MASTERADMIN", "ADMIN"))):
    user_count = db.execute(select(func.count(User.id))).scalar()
    school_count = db.execute(select(func.count(School.id))).scalar()
    attendance_count = db.execute(select(func.count(AttendanceLog.id))).scalar()
    catering_count = db.execute(select(func.count(CateringLog.id))).scalar()
    feedback_count = db.execute(select(func.count(Feedback.id))).scalar()
    emergency_count = db.execute(select(func.count(EmergencyReport.id))).scalar()
    return {
        "users": user_count,
        "schools": school_count,
        "attendance_logs": attendance_count,
        "catering_logs": catering_count,
        "feedbacks": feedback_count,
        "emergency_reports": emergency_count,
    }
@router.get("/school")
def dashboard_school(db: Session = Depends(get_db), user=Depends(require_roles("SEKOLAH", "MASTERADMIN"))):
    # Contoh: jumlah siswa, log kehadiran, dsb
    attendance_count = db.execute(select(func.count(AttendanceLog.id))).scalar()
    return {"attendance_logs": attendance_count}
@router.get("/catering")
def dashboard_catering(db: Session = Depends(get_db), user=Depends(require_roles("KATERING", "MASTERADMIN"))):
    catering_count = db.execute(select(func.count(CateringLog.id))).scalar()
    return {"catering_logs": catering_count}
@router.get("/admin")
def dashboard_admin(db: Session = Depends(get_db), user=Depends(require_roles("ADMIN", "MASTERADMIN"))):
    user_count = db.execute(select(func.count(User.id))).scalar()
    school_count = db.execute(select(func.count(School.id))).scalar()
    return {"users": user_count, "schools": school_count}
