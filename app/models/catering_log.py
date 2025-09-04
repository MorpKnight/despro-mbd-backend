import uuid
from sqlalchemy import String, Date, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import date
from app.models.base import Base


class CateringLog(Base):
    __tablename__ = "catering_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tanggal: Mapped[date] = mapped_column(Date, nullable=False)
    deskripsiMenu: Mapped[str] = mapped_column(Text, nullable=False)
    fotoMenuUrl: Mapped[str] = mapped_column(String, nullable=False)
    catatan: Mapped[str | None] = mapped_column(Text, nullable=True)
