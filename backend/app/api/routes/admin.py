import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.category import Category
from app.models.lead import Lead
from app.models.profile import Profile
from app.models.project import Project
from app.models.service import Service
from app.models.user import User
from app.schemas.auth import (
    ProfileAdminOut,
    ProfileAdminWrite,
    ServiceAdminOut,
    ServiceAdminWrite,
)
from app.schemas.lead import LeadAdminOut, LeadStatusUpdate
from app.schemas.project_admin import (
    CategoryAdminOut,
    ProjectAdminOut,
    ProjectWrite,
    project_to_admin,
    slugify,
)
from app.services.content_sync import (
    sync_profile_to_content,
    sync_projects_to_content,
    sync_services_to_content,
)
from pydantic import BaseModel

router = APIRouter()


class AdminStatsOut(BaseModel):
    leads_total: int
    leads_new: int
    leads_in_progress: int
    projects_total: int
    projects_published: int
    projects_featured: int


class ProjectFlagsUpdate(BaseModel):
    is_featured: bool | None = None
    is_published: bool | None = None
    is_draft: bool | None = None


class ServiceFlagsUpdate(BaseModel):
    is_published: bool | None = None
    sort_order: int | None = None


async def _get_project(db: AsyncSession, project_id: int) -> Project:
    result = await db.execute(
        select(Project).options(selectinload(Project.category)).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


async def _unique_slug(db: AsyncSession, slug: str, exclude_id: int | None = None) -> str:
    base = slug
    n = 2
    while True:
        query = select(Project.id).where(Project.slug == slug)
        if exclude_id is not None:
            query = query.where(Project.id != exclude_id)
        exists = (await db.execute(query)).scalar_one_or_none()
        if exists is None:
            return slug
        slug = f"{base}-{n}"
        n += 1


def _apply_write(project: Project, payload: ProjectWrite) -> None:
    project.title = payload.title
    project.summary = payload.summary
    project.cover_url = payload.cover_url or None
    project.year = payload.year
    project.role = payload.role
    project.technologies = ", ".join(payload.stack) if payload.stack else ""
    project.client_name = payload.client_name
    project.content_blocks = json.dumps(payload.results, ensure_ascii=False)
    project.github_url = payload.github_url or None
    project.live_url = payload.live_url or None
    project.status = payload.status or "production"
    project.category_id = payload.category_id
    project.category_label = payload.category_label or ""
    project.sort_order = payload.sort_order
    project.is_featured = payload.is_featured
    project.is_published = payload.is_published
    project.is_draft = payload.is_draft


@router.get("/stats", response_model=AdminStatsOut)
async def admin_stats(
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminStatsOut:
    leads_total = (await db.execute(select(func.count()).select_from(Lead))).scalar_one()
    leads_new = (
        await db.execute(select(func.count()).select_from(Lead).where(Lead.status == "new"))
    ).scalar_one()
    leads_in_progress = (
        await db.execute(select(func.count()).select_from(Lead).where(Lead.status == "in_progress"))
    ).scalar_one()
    projects_total = (await db.execute(select(func.count()).select_from(Project))).scalar_one()
    projects_published = (
        await db.execute(select(func.count()).select_from(Project).where(Project.is_published.is_(True)))
    ).scalar_one()
    projects_featured = (
        await db.execute(select(func.count()).select_from(Project).where(Project.is_featured.is_(True)))
    ).scalar_one()

    return AdminStatsOut(
        leads_total=leads_total,
        leads_new=leads_new,
        leads_in_progress=leads_in_progress,
        projects_total=projects_total,
        projects_published=projects_published,
        projects_featured=projects_featured,
    )


@router.get("/leads", response_model=list[LeadAdminOut])
async def list_leads(
    status_filter: str | None = Query(default=None, alias="status"),
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> list[Lead]:
    query = select(Lead).order_by(Lead.created_at.desc())
    if status_filter:
        query = query.where(Lead.status == status_filter)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.patch("/leads/{lead_id}", response_model=LeadAdminOut)
async def update_lead_status(
    lead_id: int,
    payload: LeadStatusUpdate,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> Lead:
    lead = (await db.execute(select(Lead).where(Lead.id == lead_id))).scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    lead.status = payload.status
    await db.commit()
    await db.refresh(lead)
    return lead


@router.delete("/leads/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lead(
    lead_id: int,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    lead = (await db.execute(select(Lead).where(Lead.id == lead_id))).scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    await db.delete(lead)
    await db.commit()


@router.get("/categories", response_model=list[CategoryAdminOut])
async def list_categories_admin(
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> list[Category]:
    result = await db.execute(select(Category).order_by(Category.sort_order, Category.id))
    return list(result.scalars().all())


@router.get("/projects", response_model=list[ProjectAdminOut])
async def list_projects_admin(
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> list[ProjectAdminOut]:
    result = await db.execute(
        select(Project).options(selectinload(Project.category)).order_by(Project.sort_order, Project.id)
    )
    return [project_to_admin(p) for p in result.scalars().all()]


@router.get("/projects/{project_id}", response_model=ProjectAdminOut)
async def get_project_admin(
    project_id: int,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> ProjectAdminOut:
    project = await _get_project(db, project_id)
    return project_to_admin(project)


@router.post("/projects", response_model=ProjectAdminOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectWrite,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> ProjectAdminOut:
    raw_slug = payload.slug or slugify(payload.title)
    slug = await _unique_slug(db, raw_slug)

    if payload.category_id is not None:
        cat = (
            await db.execute(select(Category.id).where(Category.id == payload.category_id))
        ).scalar_one_or_none()
        if cat is None:
            raise HTTPException(status_code=400, detail="Category not found")

    project = Project(slug=slug)
    _apply_write(project, payload)
    project.slug = slug
    db.add(project)
    await db.commit()
    project = await _get_project(db, project.id)
    await sync_projects_to_content(db)
    return project_to_admin(project)


@router.put("/projects/{project_id}", response_model=ProjectAdminOut)
async def update_project(
    project_id: int,
    payload: ProjectWrite,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> ProjectAdminOut:
    project = await _get_project(db, project_id)

    if payload.category_id is not None:
        cat = (
            await db.execute(select(Category.id).where(Category.id == payload.category_id))
        ).scalar_one_or_none()
        if cat is None:
            raise HTTPException(status_code=400, detail="Category not found")

    raw_slug = payload.slug or slugify(payload.title)
    project.slug = await _unique_slug(db, raw_slug, exclude_id=project.id)
    _apply_write(project, payload)

    await db.commit()
    project = await _get_project(db, project.id)
    await sync_projects_to_content(db)
    return project_to_admin(project)


@router.patch("/projects/{project_id}", response_model=ProjectAdminOut)
async def update_project_flags(
    project_id: int,
    payload: ProjectFlagsUpdate,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> ProjectAdminOut:
    project = await _get_project(db, project_id)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(project, key, value)
    await db.commit()
    project = await _get_project(db, project.id)
    await sync_projects_to_content(db)
    return project_to_admin(project)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    project = await _get_project(db, project_id)
    await db.delete(project)
    await db.commit()
    await sync_projects_to_content(db)


async def _get_or_create_profile(db: AsyncSession) -> Profile:
    profile = (await db.execute(select(Profile).limit(1))).scalar_one_or_none()
    if profile:
        return profile
    profile = Profile()
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def _unique_service_slug(db: AsyncSession, slug: str, exclude_id: int | None = None) -> str:
    base = slug
    n = 2
    while True:
        query = select(Service.id).where(Service.slug == slug)
        if exclude_id is not None:
            query = query.where(Service.id != exclude_id)
        exists = (await db.execute(query)).scalar_one_or_none()
        if exists is None:
            return slug
        slug = f"{base}-{n}"
        n += 1


async def _get_service(db: AsyncSession, service_id: int) -> Service:
    service = (await db.execute(select(Service).where(Service.id == service_id))).scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service


def _apply_service(service: Service, payload: ServiceAdminWrite, slug: str) -> None:
    service.title = payload.title
    service.slug = slug
    service.short_description = payload.short_description
    service.scope = payload.scope
    service.stages = payload.stages
    service.timeline = payload.timeline
    service.price_from = payload.price_from
    service.sort_order = payload.sort_order
    service.is_published = payload.is_published


@router.get("/profile", response_model=ProfileAdminOut)
async def get_profile_admin(
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> Profile:
    return await _get_or_create_profile(db)


@router.put("/profile", response_model=ProfileAdminOut)
async def update_profile_admin(
    payload: ProfileAdminWrite,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> Profile:
    profile = await _get_or_create_profile(db)
    for key, value in payload.model_dump().items():
        setattr(profile, key, value)
    await db.commit()
    await db.refresh(profile)
    await sync_profile_to_content(db)
    return profile


@router.get("/services", response_model=list[ServiceAdminOut])
async def list_services_admin(
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> list[Service]:
    result = await db.execute(select(Service).order_by(Service.sort_order, Service.id))
    return list(result.scalars().all())


@router.post("/services", response_model=ServiceAdminOut, status_code=status.HTTP_201_CREATED)
async def create_service(
    payload: ServiceAdminWrite,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> Service:
    raw_slug = payload.slug or slugify(payload.title)
    slug = await _unique_service_slug(db, raw_slug)
    service = Service(slug=slug)
    _apply_service(service, payload, slug)
    db.add(service)
    await db.commit()
    await db.refresh(service)
    await sync_services_to_content(db)
    return service


@router.put("/services/{service_id}", response_model=ServiceAdminOut)
async def update_service(
    service_id: int,
    payload: ServiceAdminWrite,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> Service:
    service = await _get_service(db, service_id)
    raw_slug = payload.slug or slugify(payload.title)
    slug = await _unique_service_slug(db, raw_slug, exclude_id=service.id)
    _apply_service(service, payload, slug)
    await db.commit()
    await db.refresh(service)
    await sync_services_to_content(db)
    return service


@router.patch("/services/{service_id}", response_model=ServiceAdminOut)
async def patch_service(
    service_id: int,
    payload: ServiceFlagsUpdate,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> Service:
    service = await _get_service(db, service_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, key, value)
    await db.commit()
    await db.refresh(service)
    await sync_services_to_content(db)
    return service


@router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    service = await _get_service(db, service_id)
    await db.delete(service)
    await db.commit()
    await sync_services_to_content(db)
