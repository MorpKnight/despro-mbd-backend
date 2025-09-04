from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime

from app.db.session import get_db
from app.models import EmergencyReport
from app.api.deps import require_roles

router = APIRouter(prefix="/emergency-report", tags=["emergency-report"])

@router.get("/", response_model=list[dict])
def list_reports(db: Session = Depends(get_db), user=Depends(require_roles("SISWA", "SEKOLAH", "MASTERADMIN"))):
    reports = db.execute(select(EmergencyReport)).scalars().all()
    return [r.__dict__ for r in reports]

@router.post("/", response_model=dict)
def create_report(
    deskripsi: str,
    status: str = "BARU",
    db: Session = Depends(get_db),
    user=Depends(require_roles("SISWA", "SEKOLAH", "MASTERADMIN"))
):
    report = EmergencyReport(
        deskripsi=deskripsi,
        status=status,
        timestamp=datetime.utcnow(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report.__dict__

@router.get("/{report_id}", response_model=dict)
def get_report(report_id: str, db: Session = Depends(get_db), user=Depends(require_roles("SISWA", "SEKOLAH", "MASTERADMIN"))):
    report = db.execute(select(EmergencyReport).where(EmergencyReport.id == report_id)).scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report.__dict__

@router.put("/{report_id}", response_model=dict)
def update_report(
    report_id: str,
    deskripsi: str,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(require_roles("SISWA", "SEKOLAH", "MASTERADMIN"))
):
    report = db.execute(select(EmergencyReport).where(EmergencyReport.id == report_id)).scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.deskripsi = deskripsi
    report.status = status
    db.commit()
    db.refresh(report)
    return report.__dict__

@router.delete("/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db), user=Depends(require_roles("SISWA", "SEKOLAH", "MASTERADMIN"))):
    report = db.execute(select(EmergencyReport).where(EmergencyReport.id == report_id)).scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"success": True}
@router.get("/me", response_model=list[dict])
def emergency_me(db: Session = Depends(get_db), user=Depends(require_roles("SISWA", "SEKOLAH", "MASTERADMIN"))):
    # Asumsi: user.id == pelapor
    # TODO: filter by user if relasi ada
    reports = db.execute(select(EmergencyReport)).scalars().all()
    return [r.__dict__ for r in reports]
