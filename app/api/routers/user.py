from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models import User
from app.schemas.user import UserOut, UserCreate
from app.core.security import hash_password
from app.core.security import hash_password
from app.api.deps import require_roles

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), user=Depends(require_roles("MASTERADMIN"))):
    return db.execute(select(User)).scalars().all()

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db), user=Depends(require_roles("MASTERADMIN"))):
    u = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u

@router.post("/", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db), user=Depends(require_roles("MASTERADMIN"))):
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

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: str, payload: UserCreate, db: Session = Depends(get_db), user=Depends(require_roles("MASTERADMIN"))):
    u = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in payload.model_dump().items():
        setattr(u, field, value)
    db.commit()
    db.refresh(u)
    return u

@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), user=Depends(require_roles("MASTERADMIN"))):
    u = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(u)
    db.commit()
    return {"success": True}
@router.post("/masteradmin", response_model=UserOut)
def create_masteradmin(payload: UserCreate, db: Session = Depends(get_db), user=Depends(require_roles("MASTERADMIN"))):
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
