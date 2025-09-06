from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime

from app.db.session import get_db
from app.models import AttendanceLog, User, School
from pydantic import BaseModel
from app.middlewares.api_key import require_api_key

router = APIRouter(prefix="/attendance", tags=["attendance"])
from app.schemas.attendance_log import AttendanceLogOut
from typing import Optional
from sqlalchemy import func

router = APIRouter(prefix="/attendance", tags=["attendance"])

# Endpoint rekap absensi per user per bulan
@router.get("/rekap/{user_id}")
def rekap_absensi_user(
    user_id: str,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    request: Request = None
):
    # Default: bulan & tahun sekarang
    now = datetime.utcnow()
    month = month or now.month
    year = year or now.year
    user = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    logs = db.query(AttendanceLog).filter(
        AttendanceLog.UserId == user_id,
        func.extract('month', AttendanceLog.timestamp) == month,
        func.extract('year', AttendanceLog.timestamp) == year
    ).all()
    total_hadir = len(logs)
    # Untuk pengembangan: bisa tambahkan status (izin, alfa, dsb) jika ada field status di AttendanceLog
    return {
        "user_id": user_id,
        "nama": user.namaLengkap,
        "month": month,
        "year": year,
        "total_hadir": total_hadir
    }
# Endpoint rekap absensi per user per bulan
@router.get("/rekap/{user_id}")
def rekap_absensi_user(
    user_id: str,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    request: Request = None
):
    # Default: bulan & tahun sekarang
    now = datetime.utcnow()
    month = month or now.month
    year = year or now.year
    user = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    logs = db.query(AttendanceLog).filter(
        AttendanceLog.UserId == user_id,
        func.extract('month', AttendanceLog.timestamp) == month,
        func.extract('year', AttendanceLog.timestamp) == year
    ).all()
    total_hadir = len(logs)
    # Untuk pengembangan: bisa tambahkan status (izin, alfa, dsb) jika ada field status di AttendanceLog
    return {
        "user_id": user_id,
        "nama": user.namaLengkap,
        "month": month,
        "year": year,
        "total_hadir": total_hadir
    }
class AttendanceSyncRequest(BaseModel):
    logs: list[dict]

@router.post("/sync")
def sync_attendance(payload: AttendanceSyncRequest, request: Request, db: Session = Depends(get_db)):
    school = require_api_key(request)
    inserted = []
    for log_data in payload.logs:
        user_id = log_data.get("UserId")
        timestamp = log_data.get("timestamp")
        user = db.execute(select(User).where(User.id == user_id)).scalars().first()
        if not user:
            continue
        log = AttendanceLog(
            timestamp=timestamp or datetime.utcnow(),
            UserId=user.id,
            SchoolId=school.id,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        inserted.append(log.id)
    return {"success": True, "inserted": inserted}

@router.post("/log")
def log_attendance(
    user_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    school = require_api_key(request)
    user = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    log = AttendanceLog(
        timestamp=datetime.utcnow(),
        UserId=user.id,
        SchoolId=school.id,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"success": True, "log_id": log.id}
