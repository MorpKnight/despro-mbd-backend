import uuid
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.models.base import Base


class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    syncTimestamp: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    UserId: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    SchoolId: Mapped[str] = mapped_column(String, ForeignKey("schools.id"), nullable=False)

    user = relationship("User", back_populates="attendance_logs")
    school = relationship("School")
