import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class School(Base):
    __tablename__ = "schools"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    namaSekolah: Mapped[str] = mapped_column(String, nullable=False)
    alamat: Mapped[str] = mapped_column(String, nullable=False)
    apiKey: Mapped[str] = mapped_column(String, unique=True, nullable=False, default=lambda: str(uuid.uuid4()))

    users = relationship("User", back_populates="school", cascade="all, delete-orphan")
