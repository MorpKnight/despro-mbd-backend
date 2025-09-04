from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.core.rate_limit import limiter
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models import User
from app.schemas.user import UserCreate, UserOut
from pydantic import BaseModel, EmailStr
from app.core.security import create_access_token, verify_password, hash_password
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    # email unique
    exists = db.execute(select(User).where(User.email == payload.email)).scalars().first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already used")
    user = User(
        namaLengkap=payload.namaLengkap,
        email=payload.email,
        role=payload.role,
        nfcTagId=payload.nfcTagId,
        SchoolId=payload.SchoolId,
        password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
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
