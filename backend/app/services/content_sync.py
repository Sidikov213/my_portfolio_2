import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.profile import Profile
from app.models.project import Project
from app.models.service import Service
from app.schemas.project_admin import parse_results, parse_stack

CONTENT_PATH = (
    Path(__file__).resolve().parents[3] / "frontend" / "src" / "data" / "portfolio-content.json"
)


def _load() -> dict:
    return json.loads(CONTENT_PATH.read_text(encoding="utf-8"))


def _save(payload: dict) -> None:
    CONTENT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def project_to_content_item(project: Project) -> dict:
    category = (
        (project.category_label or "").strip()
        or (project.category.name if project.category else "")
    )
    return {
        "slug": project.slug,
        "title": project.title,
        "category": category,
        "year": str(project.year) if project.year else "",
        "status": project.status or "production",
        "featured": bool(project.is_featured),
        "role": project.role or "",
        "summary": project.summary or "",
        "stack": parse_stack(project.technologies or ""),
        "results": parse_results(project.content_blocks or "[]"),
        "github": project.github_url,
        "live": project.live_url,
        "cover": project.cover_url,
    }


async def sync_projects_to_content(db: AsyncSession) -> None:
    if not CONTENT_PATH.exists():
        return

    result = await db.execute(
        select(Project)
        .options(selectinload(Project.category))
        .where(Project.is_published.is_(True), Project.is_draft.is_(False))
        .order_by(Project.sort_order.asc(), Project.id.asc())
    )
    projects = [project_to_content_item(p) for p in result.scalars().all()]
    payload = _load()
    payload["projects"] = projects
    _save(payload)


async def sync_profile_to_content(db: AsyncSession) -> None:
    if not CONTENT_PATH.exists():
        return

    profile = (await db.execute(select(Profile).limit(1))).scalar_one_or_none()
    if not profile:
        return

    payload = _load()
    profile_block = payload.setdefault("profile", {})
    contacts = payload.setdefault("contacts", {})

    profile_block["fullNameRu"] = profile.full_name or profile_block.get("fullNameRu", "")
    profile_block["profession"] = profile.profession or ""
    profile_block["specialization"] = profile.specialization or ""
    if profile.slogan:
        profile_block["tagline"] = profile.slogan
    if profile.bio:
        profile_block["shortBio"] = profile.bio
    if profile.city:
        # keep region suffix if already present
        existing_loc = profile_block.get("location", "")
        if profile.city in existing_loc:
            profile_block["location"] = existing_loc
        else:
            profile_block["location"] = profile.city
    if profile.timezone:
        profile_block["timezone"] = profile.timezone
    if profile.availability_status:
        profile_block["availabilityText"] = profile.availability_status
    profile_block["availability"] = "open" if profile.is_available else "busy"
    if profile.resume_url:
        profile_block["resumePath"] = profile.resume_url

    contacts["email"] = profile.email or contacts.get("email", "")
    if profile.telegram:
        tg = profile.telegram.strip()
        if tg.startswith("http"):
            contacts["telegram"] = tg
        elif tg.startswith("@"):
            contacts["telegram"] = f"https://t.me/{tg[1:]}"
        else:
            contacts["telegram"] = f"https://t.me/{tg}"
    if profile.github:
        contacts["github"] = profile.github
    if profile.linkedin:
        contacts["linkedin"] = profile.linkedin
    if profile.phone:
        contacts["phone"] = profile.phone

    _save(payload)


async def sync_services_to_content(db: AsyncSession) -> None:
    if not CONTENT_PATH.exists():
        return

    result = await db.execute(
        select(Service)
        .where(Service.is_published.is_(True))
        .order_by(Service.sort_order.asc(), Service.id.asc())
    )
    services = [
        {
            "slug": s.slug,
            "title": s.title,
            "description": s.short_description or "",
            "price": s.price_from or "По запросу",
            "duration": s.timeline or "",
        }
        for s in result.scalars().all()
    ]
    payload = _load()
    payload["services"] = services
    _save(payload)
