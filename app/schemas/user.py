from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    namaLengkap: str
    email: EmailStr
    role: str
    nfcTagId: Optional[str] = None
    SchoolId: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: str

    class Config:
        from_attributes = True
