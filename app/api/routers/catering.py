from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import date

from app.db.session import get_db
from app.models import CateringLog
from app.api.deps import require_roles

router = APIRouter(prefix="/catering", tags=["catering"])

@router.get("/", response_model=list[dict])
def list_catering(db: Session = Depends(get_db), user=Depends(require_roles("SEKOLAH", "KATERING", "MASTERADMIN"))):
    logs = db.execute(select(CateringLog)).scalars().all()
    return [log.__dict__ for log in logs]

@router.post("/", response_model=dict)
def create_catering(
    tanggal: date,
    deskripsiMenu: str,
    fotoMenuUrl: str,
    catatan: str = "",
    db: Session = Depends(get_db),
    user=Depends(require_roles("SEKOLAH", "KATERING", "MASTERADMIN"))
):
    log = CateringLog(
        tanggal=tanggal,
        deskripsiMenu=deskripsiMenu,
        fotoMenuUrl=fotoMenuUrl,
        catatan=catatan,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log.__dict__

@router.get("/{log_id}", response_model=dict)
def get_catering(log_id: str, db: Session = Depends(get_db), user=Depends(require_roles("SEKOLAH", "KATERING", "MASTERADMIN"))):
    log = db.execute(select(CateringLog).where(CateringLog.id == log_id)).scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Catering log not found")
    return log.__dict__

@router.put("/{log_id}", response_model=dict)
def update_catering(
    log_id: str,
    tanggal: date,
    deskripsiMenu: str,
    fotoMenuUrl: str,
    catatan: str = "",
    db: Session = Depends(get_db),
    user=Depends(require_roles("SEKOLAH", "KATERING", "MASTERADMIN"))
):
    log = db.execute(select(CateringLog).where(CateringLog.id == log_id)).scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Catering log not found")
    log.tanggal = tanggal
    log.deskripsiMenu = deskripsiMenu
    log.fotoMenuUrl = fotoMenuUrl
    log.catatan = catatan
    db.commit()
    db.refresh(log)
    return log.__dict__

@router.delete("/{log_id}")
def delete_catering(log_id: str, db: Session = Depends(get_db), user=Depends(require_roles("SEKOLAH", "KATERING", "MASTERADMIN"))):
    log = db.execute(select(CateringLog).where(CateringLog.id == log_id)).scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Catering log not found")
    db.delete(log)
    db.commit()
    return {"success": True}

@router.get("/me", response_model=list[dict])
def catering_me(db: Session = Depends(get_db), user=Depends(require_roles("KATERING"))):
    # Asumsi: user.id == katering yang bersangkutan
    # TODO: filter by user if relasi ada
    logs = db.execute(select(CateringLog)).scalars().all()
    return [log.__dict__ for log in logs]