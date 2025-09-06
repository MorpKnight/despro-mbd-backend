import io
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime
from typing import Optional
import pandas as pd

from app.db.session import get_db
from app.models import AttendanceLog, User, School
from app.models.attendance_correction import AttendanceCorrection
from app.middlewares.api_key import require_api_key
from app.schemas.attendance_log import AttendanceLogOut
from app.schemas.attendance_correction import AttendanceCorrectionCreate, AttendanceCorrectionOut, AttendanceCorrectionReview
from pydantic import BaseModel

router = APIRouter(prefix="/attendance", tags=["attendance"])

# Absensi manual oleh admin
class ManualAttendanceCreate(BaseModel):
    user_id: str
    school_id: str
    timestamp: Optional[str] = None  # format: YYYY-MM-DD HH:MM:SS

@router.post("/manual", response_model=AttendanceLogOut)
def manual_attendance(
    payload: ManualAttendanceCreate,
    db: Session = Depends(get_db)
):
    user = db.execute(select(User).where(User.id == payload.user_id)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    school = db.execute(select(School).where(School.id == payload.school_id)).scalars().first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    if payload.timestamp:
        try:
            ts = datetime.strptime(payload.timestamp, "%Y-%m-%d %H:%M:%S")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid timestamp format. Use YYYY-MM-DD HH:MM:SS.")
    else:
        ts = datetime.utcnow()
    log = AttendanceLog(
        timestamp=ts,
        UserId=user.id,
        SchoolId=school.id,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    print(f"[NOTIF] Absensi manual oleh admin untuk user {user.id} di sekolah {school.id} pada {ts}")
    return log

# Riwayat absensi per user (bisa difilter tanggal)
@router.get("/riwayat/{user_id}", response_model=list[AttendanceLogOut])
def riwayat_absensi_user(
    user_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    user = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    query = db.query(AttendanceLog).filter(AttendanceLog.UserId == user_id)
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(AttendanceLog.timestamp >= start_dt)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD.")
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(AttendanceLog.timestamp <= end_dt)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD.")
    logs = query.order_by(AttendanceLog.timestamp.desc()).all()
    return logs

# Pengajuan koreksi absensi oleh user
@router.post("/correction", response_model=AttendanceCorrectionOut)
def request_attendance_correction(
    payload: AttendanceCorrectionCreate,
    db: Session = Depends(get_db),
    request: Request = None
):
    attendance_log = db.execute(select(AttendanceLog).where(AttendanceLog.id == payload.attendance_log_id)).scalars().first()
    if not attendance_log:
        raise HTTPException(status_code=404, detail="Attendance log not found")
    correction = AttendanceCorrection(
        attendance_log_id=payload.attendance_log_id,
        user_id=attendance_log.UserId,
        reason=payload.reason,
        status="PENDING"
    )
    db.add(correction)
    db.commit()
    db.refresh(correction)
    print(f"[NOTIF] Pengajuan koreksi absensi oleh user {attendance_log.UserId} untuk log {payload.attendance_log_id}")
    return correction

# Approval/reject koreksi absensi oleh admin sekolah
@router.post("/correction/{correction_id}/review", response_model=AttendanceCorrectionOut)
def review_attendance_correction(
    correction_id: str,
    payload: AttendanceCorrectionReview,
    db: Session = Depends(get_db),
    request: Request = None
):
    correction = db.execute(select(AttendanceCorrection).where(AttendanceCorrection.id == correction_id)).scalars().first()
    if not correction:
        raise HTTPException(status_code=404, detail="Attendance correction not found")
    if correction.status != "PENDING":
        raise HTTPException(status_code=400, detail="Correction already reviewed")
    correction.status = "APPROVED" if payload.approve else "REJECTED"
    correction.review_note = payload.review_note
    correction.reviewed_at = datetime.utcnow()
    db.add(correction)
    db.commit()
    db.refresh(correction)
    print(f"[NOTIF] Koreksi absensi {correction_id} di-review: {correction.status}. Note: {payload.review_note}")
    return correction

# Statistik absensi harian per user per bulan
@router.get("/statistik/{user_id}")
def statistik_absensi_user(
    user_id: str,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
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
    statistik = {}
    for log in logs:
        tanggal = log.timestamp.strftime("%Y-%m-%d")
        statistik[tanggal] = statistik.get(tanggal, 0) + 1
    statistik_sorted = dict(sorted(statistik.items()))
    return {
        "user_id": user_id,
        "nama": user.namaLengkap,
        "month": month,
        "year": year,
        "statistik_harian": statistik_sorted
    }

# Export absensi ke Excel/CSV
@router.get("/export/{user_id}")
def export_absensi_user(
    user_id: str,
    month: Optional[int] = None,
    year: Optional[int] = None,
    format: str = "xlsx",
    db: Session = Depends(get_db)
):
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
    data = [
        {
            "Tanggal": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "UserId": log.UserId,
            "SchoolId": log.SchoolId,
        }
        for log in logs
    ]
    df = pd.DataFrame(data)
    if format == "csv":
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={
            "Content-Disposition": f"attachment; filename=absensi_{user_id}_{month}_{year}.csv"
        })
    else:
        output = io.BytesIO()
        df.to_excel(output, index=False, engine="openpyxl")
        output.seek(0)
        return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
            "Content-Disposition": f"attachment; filename=absensi_{user_id}_{month}_{year}.xlsx"
        })

# Rekap absensi per user per bulan
@router.get("/rekap/{user_id}")
def rekap_absensi_user(
    user_id: str,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    request: Request = None
):
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
    return {
        "user_id": user_id,
        "nama": user.namaLengkap,
        "month": month,
        "year": year,
        "total_hadir": total_hadir
    }

# Sinkronisasi absensi (sync dari device)
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

# Log absensi (device/manual)
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