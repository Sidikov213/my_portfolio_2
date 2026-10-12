from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin


class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(200), default="")
    profession: Mapped[str] = mapped_column(String(200), default="")
    specialization: Mapped[str] = mapped_column(String(200), default="")
    slogan: Mapped[str] = mapped_column(Text, default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    city: Mapped[str] = mapped_column(String(120), default="")
    timezone: Mapped[str] = mapped_column(String(80), default="")
    email: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str] = mapped_column(String(80), default="")
    telegram: Mapped[str] = mapped_column(String(120), default="")
    github: Mapped[str] = mapped_column(String(255), default="")
    linkedin: Mapped[str] = mapped_column(String(255), default="")
    behance: Mapped[str] = mapped_column(String(255), default="")
    dribbble: Mapped[str] = mapped_column(String(255), default="")
    availability_status: Mapped[str] = mapped_column(String(120), default="Open for projects")
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    resume_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
