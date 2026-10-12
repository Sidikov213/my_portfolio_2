from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(280), unique=True, index=True)
    summary: Mapped[str] = mapped_column(Text, default="")
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    role: Mapped[str] = mapped_column(String(200), default="")
    technologies: Mapped[str] = mapped_column(Text, default="")
    client_name: Mapped[str] = mapped_column(String(200), default="")
    content_blocks: Mapped[str] = mapped_column(Text, default="[]")
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True, default=None)
    live_url: Mapped[str | None] = mapped_column(String(500), nullable=True, default=None)
    status: Mapped[str] = mapped_column(String(80), default="production")
    category_label: Mapped[str] = mapped_column(String(200), default="")
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    is_draft: Mapped[bool] = mapped_column(Boolean, default=True)

    category = relationship("Category", back_populates="projects")
