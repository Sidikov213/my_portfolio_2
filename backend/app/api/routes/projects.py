from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.category import Category
from app.models.project import Project
from app.schemas.project import CategoryOut, ProjectDetail, ProjectListItem

router = APIRouter()


@router.get("", response_model=list[ProjectListItem])
async def list_projects(
    category: str | None = Query(default=None),
    featured: bool | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[Project]:
    stmt = (
        select(Project)
        .options(selectinload(Project.category))
        .where(Project.is_published.is_(True), Project.is_draft.is_(False))
        .order_by(Project.sort_order.asc(), Project.id.desc())
    )

    if featured is not None:
        stmt = stmt.where(Project.is_featured.is_(featured))

    if category:
        stmt = stmt.join(Category).where(Category.slug == category)

    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)) -> list[Category]:
    result = await db.execute(
        select(Category).where(Category.is_active.is_(True)).order_by(Category.sort_order.asc())
    )
    return list(result.scalars().all())


@router.get("/{slug}", response_model=ProjectDetail)
async def get_project(slug: str, db: AsyncSession = Depends(get_db)) -> Project:
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.category))
        .where(
            Project.slug == slug,
            Project.is_published.is_(True),
            Project.is_draft.is_(False),
        )
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
