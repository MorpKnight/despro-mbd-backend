from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import random

from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models import User
from app.schemas.user import UserCreate, UserOut
from app.core.security import create_access_token, verify_password, hash_password
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

# Request OTP untuk reset password
class RequestOTP(BaseModel):
    email: EmailStr

@router.post("/request-reset-password")
def request_reset_password(payload: RequestOTP, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == payload.email)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    otp = str(random.randint(100000, 999999))
    expiry = (datetime.utcnow() + timedelta(minutes=10)).isoformat()
    user.otp_code = otp
    user.otp_expiry = expiry
    db.add(user)
    db.commit()
    print(f"[OTP] Kode OTP reset password untuk {user.email}: {otp} (berlaku 10 menit)")
    return {"success": True, "message": "OTP sent (dummy, check console)"}

# Reset password dengan OTP
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == payload.email)).scalars().first()
    if not user or not user.otp_code or not user.otp_expiry:
        raise HTTPException(status_code=400, detail="OTP not requested or expired")
    # Cek expiry
    if datetime.utcnow() > datetime.fromisoformat(user.otp_expiry):
        raise HTTPException(status_code=400, detail="OTP expired")
    if user.otp_code != payload.otp:
        raise HTTPException(status_code=400, detail="OTP salah")
    user.password = hash_password(payload.new_password)
    user.otp_code = None
    user.otp_expiry = None
    db.add(user)
    db.commit()
    print(f"[NOTIF] Password user {user.email} berhasil direset.")
    return {"success": True, "message": "Password reset successful"}

# Register endpoint khusus siswa (user mendaftar sendiri, status PENDING, wajib pilih sekolah)
@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    # Hanya siswa yang bisa register sendiri
    if payload.role != "SISWA":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only SISWA can self-register")
    # Email harus unik
    exists = db.execute(select(User).where(User.email == payload.email)).scalars().first()
    if exists:
        # Jika status REJECTED, boleh daftar ulang (hapus user lama)
        if exists.role == "SISWA" and exists.status == "REJECTED":
            db.delete(exists)
            db.commit()
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already used")
    # Wajib pilih sekolah
    if not payload.SchoolId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SchoolId is required")
    user = User(
        namaLengkap=payload.namaLengkap,
        email=payload.email,
        role="SISWA",
        nfcTagId=payload.nfcTagId,
        SchoolId=payload.SchoolId,
        password=hash_password(payload.password),
        status="PENDING",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"[NOTIF] Siswa baru mendaftar: {user.email}, menunggu approval admin sekolah.")
    return user

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
@limiter.limit("5/minute")
def login(payload: LoginRequest, db: Session = Depends(get_db), request: Request = None):
    user = db.execute(select(User).where(User.email == payload.email)).scalars().first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return {"success": True, "token": token, "user": UserOut.model_validate(user).model_dump()}

@router.get("/me", response_model=UserOut)
def me(current=Depends(get_current_user)):
    return current