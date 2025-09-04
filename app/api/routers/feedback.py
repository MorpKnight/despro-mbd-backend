from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime

from app.db.session import get_db
from app.models import Feedback
from app.api.deps import require_roles

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.get("/", response_model=list[dict])
def list_feedback(db: Session = Depends(get_db), user=Depends(require_roles("SISWA", "MASTERADMIN"))):
    logs = db.execute(select(Feedback)).scalars().all()
    return [log.__dict__ for log in logs]

@router.post("/", response_model=dict)
def create_feedback(
    rating: int,
    komentar: str = "",
    db: Session = Depends(get_db),
    user=Depends(require_roles("SISWA", "MASTERADMIN"))
):
    log = Feedback(
        rating=rating,
        komentar=komentar,
        timestamp=datetime.utcnow(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log.__dict__

@router.get("/{log_id}", response_model=dict)
def get_feedback(log_id: str, db: Session = Depends(get_db), user=Depends(require_roles("SISWA", "MASTERADMIN"))):
    log = db.execute(select(Feedback).where(Feedback.id == log_id)).scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return log.__dict__

@router.put("/{log_id}", response_model=dict)
def update_feedback(
    log_id: str,
    rating: int,
    komentar: str = "",
    db: Session = Depends(get_db),
    user=Depends(require_roles("SISWA", "MASTERADMIN"))
):
    log = db.execute(select(Feedback).where(Feedback.id == log_id)).scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Feedback not found")
    log.rating = rating
    log.komentar = komentar
    db.commit()
    db.refresh(log)
    return log.__dict__

@router.delete("/{log_id}")
def delete_feedback(log_id: str, db: Session = Depends(get_db), user=Depends(require_roles("SISWA", "MASTERADMIN"))):
    log = db.execute(select(Feedback).where(Feedback.id == log_id)).scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Feedback not found")
    db.delete(log)
    db.commit()
    return {"success": True}
@router.get("/menu/today", response_model=list[dict])
def feedback_menu_today(db: Session = Depends(get_db), user=Depends(require_roles("SISWA", "MASTERADMIN"))):
    from datetime import date
    today = date.today()
    logs = db.execute(select(Feedback).where(func.date(Feedback.timestamp) == today)).scalars().all()
    return [log.__dict__ for log in logs]
@router.get("/me", response_model=list[dict])
def feedback_me(db: Session = Depends(get_db), user=Depends(require_roles("SISWA"))):
    # Asumsi: user.id == siswa yang bersangkutan
    # TODO: filter by user if relasi ada
    logs = db.execute(select(Feedback)).scalars().all()
    return [log.__dict__ for log in logs]
