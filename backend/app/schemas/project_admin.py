import json
import re
from typing import Any

from pydantic import BaseModel, Field, field_validator


class CategoryAdminOut(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


class ProjectAdminOut(BaseModel):
    id: int
    title: str
    slug: str
    summary: str
    cover_url: str | None = None
    year: int | None = None
    role: str = ""
    technologies: str = ""
    stack: list[str] = Field(default_factory=list)
    results: list[str] = Field(default_factory=list)
    client_name: str = ""
    github_url: str | None = None
    live_url: str | None = None
    status: str = "production"
    category_id: int | None = None
    category_name: str | None = None
    category_label: str = ""
    sort_order: int = 0
    is_featured: bool = False
    is_published: bool = False
    is_draft: bool = True


class ProjectWrite(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    slug: str | None = None
    summary: str = ""
    cover_url: str | None = None
    year: int | None = None
    role: str = ""
    stack: list[str] = Field(default_factory=list)
    results: list[str] = Field(default_factory=list)
    client_name: str = ""
    github_url: str | None = None
    live_url: str | None = None
    status: str = "production"
    category_id: int | None = None
    category_label: str = ""
    sort_order: int = 0
    is_featured: bool = False
    is_published: bool = True
    is_draft: bool = False

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str | None) -> str | None:
        if value is None or value.strip() == "":
            return None
        slug = value.strip().lower()
        slug = re.sub(r"[^a-z0-9\-]+", "-", slug)
        slug = re.sub(r"-{2,}", "-", slug).strip("-")
        return slug or None


def slugify(title: str) -> str:
    text = title.strip().lower()
    # keep latin/digits; transliterate-ish fallback for cyrillic: replace spaces
    mapping = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh",
        "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o",
        "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "ts",
        "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu",
        "я": "ya",
    }
    out = []
    for ch in text:
        if ch in mapping:
            out.append(mapping[ch])
        elif ch.isalnum() and ord(ch) < 128:
            out.append(ch)
        elif ch in {" ", "_", "-"}:
            out.append("-")
    slug = re.sub(r"-{2,}", "-", "".join(out)).strip("-")
    return slug or "project"


def parse_results(raw: str) -> list[str]:
    try:
        data = json.loads(raw or "[]")
        if isinstance(data, list):
            return [str(item) for item in data]
        if isinstance(data, dict) and isinstance(data.get("results"), list):
            return [str(item) for item in data["results"]]
    except json.JSONDecodeError:
        pass
    return []


def parse_stack(technologies: str) -> list[str]:
    return [part.strip() for part in (technologies or "").split(",") if part.strip()]


def project_to_admin(project: Any) -> ProjectAdminOut:
    return ProjectAdminOut(
        id=project.id,
        title=project.title,
        slug=project.slug,
        summary=project.summary or "",
        cover_url=project.cover_url,
        year=project.year,
        role=project.role or "",
        technologies=project.technologies or "",
        stack=parse_stack(project.technologies or ""),
        results=parse_results(project.content_blocks or "[]"),
        client_name=project.client_name or "",
        github_url=getattr(project, "github_url", None),
        live_url=getattr(project, "live_url", None),
        status=getattr(project, "status", None) or "production",
        category_id=project.category_id,
        category_name=project.category.name if project.category else None,
        category_label=getattr(project, "category_label", None) or "",
        sort_order=project.sort_order or 0,
        is_featured=bool(project.is_featured),
        is_published=bool(project.is_published),
        is_draft=bool(project.is_draft),
    )
