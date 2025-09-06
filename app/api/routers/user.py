from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel

from app.db.session import get_db
from app.models import User, RegistrationAudit
from app.schemas.user import UserOut, UserCreate
from app.core.security import hash_password
from app.api.deps import require_roles, get_current_user

router = APIRouter(prefix="/users", tags=["users"])

# List siswa PENDING (khusus admin sekolah)
@router.get("/pending-siswa", response_model=list[UserOut])
def list_pending_siswa(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only ADMIN can view pending siswa")
    siswa = db.execute(
        select(User).where(
            User.role == "SISWA",
            User.status == "PENDING",
            User.SchoolId == user.SchoolId
        )
    ).scalars().all()
    return siswa

# Model approval/reject siswa
class ApprovalRequest(BaseModel):
    approve: bool
    reason: str | None = None

# Approve/reject siswa (khusus admin sekolah)
@router.post("/approve-siswa/{user_id}")
def approve_siswa(
    user_id: str,
    payload: ApprovalRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only ADMIN can approve/reject siswa")
    siswa = db.execute(
        select(User).where(
            User.id == user_id,
            User.role == "SISWA",
            User.SchoolId == user.SchoolId
        )
    ).scalars().first()
    if not siswa:
        raise HTTPException(status_code=404, detail="Siswa not found or not in your school")
    if siswa.status != "PENDING":
        raise HTTPException(status_code=400, detail="Siswa already processed")
    siswa.status = "APPROVED" if payload.approve else "REJECTED"
    db.add(siswa)
    audit = RegistrationAudit(
        user_id=siswa.id,
        admin_id=user.id,
        status=siswa.status,
        reason=payload.reason,
    )
    db.add(audit)
    db.commit()
    db.refresh(siswa)
    print(f"[NOTIF] Siswa {siswa.email} status: {siswa.status}. Reason: {payload.reason}")
    return {"success": True, "status": siswa.status}

# List semua user (khusus masteradmin)
@router.get("/", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    user=Depends(require_roles("MASTERADMIN"))
):
    return db.execute(select(User)).scalars().all()

# Get user by id (khusus masteradmin)
@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_roles("MASTERADMIN"))
):
    u = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u

# Create user (khusus masteradmin, semua role kecuali siswa)
@router.post("/", response_model=UserOut)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("MASTERADMIN"))
):
    exists = db.execute(select(User).where(User.email == payload.email)).scalars().first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already used")
    u = User(
        namaLengkap=payload.namaLengkap,
        email=payload.email,
        role=payload.role,
        nfcTagId=payload.nfcTagId,
        SchoolId=payload.SchoolId,
        password=hash_password(payload.password),
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u

# Update user (khusus masteradmin)
@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: str,
    payload: UserCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("MASTERADMIN"))
):
    u = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in payload.model_dump().items():
        setattr(u, field, value)
    db.commit()
    db.refresh(u)
    return u

# Delete user (khusus masteradmin)
@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_roles("MASTERADMIN"))
):
    u = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(u)
    db.commit()
    return {"success": True}

# Create masteradmin baru (hanya oleh masteradmin)
@router.post("/masteradmin", response_model=UserOut)
def create_masteradmin(
    payload: UserCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles("MASTERADMIN"))
):
    exists = db.execute(select(User).where(User.email == payload.email)).scalars().first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already used")
    u = User(
        namaLengkap=payload.namaLengkap,
        email=payload.email,
        role="MASTERADMIN",
        nfcTagId=payload.nfcTagId,
        SchoolId=payload.SchoolId,
        password=hash_password(payload.password),
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u