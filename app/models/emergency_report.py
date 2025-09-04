import uuid
from sqlalchemy import String, Enum, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.models.base import Base


class EmergencyReport(Base):
    __tablename__ = "emergency_reports"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    deskripsi: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Enum("BARU", "DITINDAKLANJUTI", "SELESAI", name="emergency_status"), nullable=False, default="BARU")
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)
