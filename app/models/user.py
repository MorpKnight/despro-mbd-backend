import uuid
from sqlalchemy import String, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from passlib.context import CryptContext

from app.models.base import Base


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RoleEnum(str):
    MASTERADMIN = "MASTERADMIN"
    ADMIN = "ADMIN"
    SISWA = "SISWA"
    SEKOLAH = "SEKOLAH"
    KATERING = "KATERING"
    DINKES = "DINKES"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True) if False else String,  # use String universally; can switch to UUID on PG
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    namaLengkap: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(Enum(*[
        "MASTERADMIN", "ADMIN", "SISWA", "SEKOLAH", "KATERING", "DINKES"
    ], name="roleenum"), nullable=False)
    nfcTagId: Mapped[str | None] = mapped_column(String, nullable=True, unique=True)

    SchoolId: Mapped[str | None] = mapped_column(String, ForeignKey("schools.id"), nullable=True)
    school = relationship("School", back_populates="users")
    attendance_logs = relationship("AttendanceLog", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, raw: str) -> None:
        self.password = pwd_context.hash(raw)

    def verify_password(self, raw: str) -> bool:
        return pwd_context.verify(raw, self.password)
