import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.api.deps import get_current_admin
from app.models.user import User

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}
MAX_BYTES = 8 * 1024 * 1024  # 8 MB

PUBLIC_UPLOADS = (
    Path(__file__).resolve().parents[3] / "frontend" / "public" / "uploads" / "projects"
)


class UploadOut(BaseModel):
    url: str
    filename: str


def _safe_stem(name: str) -> str:
    stem = Path(name).stem.lower()
    stem = re.sub(r"[^a-z0-9\-]+", "-", stem).strip("-")
    return stem[:40] or "image"


@router.post("/upload", response_model=UploadOut)
async def upload_project_image(
    file: UploadFile = File(...),
    _: User = Depends(get_current_admin),
) -> UploadOut:
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name required")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Allowed formats: JPG, PNG, WEBP, GIF",
        )

    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image content type")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Max file size is 8 MB")

    PUBLIC_UPLOADS.mkdir(parents=True, exist_ok=True)
    filename = f"{_safe_stem(file.filename)}-{uuid.uuid4().hex[:10]}{ext}"
    target = PUBLIC_UPLOADS / filename
    target.write_bytes(data)

    url = f"/uploads/projects/{filename}"
    return UploadOut(url=url, filename=filename)
