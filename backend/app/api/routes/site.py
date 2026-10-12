from pathlib import Path
import json

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import get_current_admin
from app.models.user import User

router = APIRouter()

CONTENT_PATH = (
    Path(__file__).resolve().parents[4] / "frontend" / "src" / "data" / "portfolio-content.json"
)

HeroVisual = str  # "monogram" | "snakes"


class SiteSettingsOut(BaseModel):
    hero_visual: str = "monogram"


class SiteSettingsWrite(BaseModel):
    hero_visual: str = Field(pattern="^(monogram|snakes)$")


def _load_content() -> dict:
    if not CONTENT_PATH.exists():
        raise HTTPException(status_code=500, detail="Content file missing")
    return json.loads(CONTENT_PATH.read_text(encoding="utf-8"))


def _save_content(payload: dict) -> None:
    CONTENT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def _read_hero_visual() -> str:
    payload = _load_content()
    site = payload.get("site") or {}
    value = site.get("heroVisual") or "monogram"
    return value if value in {"monogram", "snakes"} else "monogram"


@router.get("/site", response_model=SiteSettingsOut)
async def get_site_settings_public() -> SiteSettingsOut:
    return SiteSettingsOut(hero_visual=_read_hero_visual())


@router.get("/admin/site", response_model=SiteSettingsOut)
async def get_site_settings_admin(_: User = Depends(get_current_admin)) -> SiteSettingsOut:
    return SiteSettingsOut(hero_visual=_read_hero_visual())


@router.put("/admin/site", response_model=SiteSettingsOut)
async def update_site_settings(
    payload: SiteSettingsWrite,
    _: User = Depends(get_current_admin),
) -> SiteSettingsOut:
    content = _load_content()
    site = content.setdefault("site", {})
    site["heroVisual"] = payload.hero_visual
    _save_content(content)
    return SiteSettingsOut(hero_visual=payload.hero_visual)
