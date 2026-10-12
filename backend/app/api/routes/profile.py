from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.profile import ProfileOut

router = APIRouter()


@router.get("", response_model=ProfileOut)
async def get_profile(db: AsyncSession = Depends(get_db)) -> Profile:
    result = await db.execute(select(Profile).limit(1))
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
