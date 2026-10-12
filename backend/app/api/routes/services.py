from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.service import Service
from app.schemas.service import ServiceOut

router = APIRouter()


@router.get("", response_model=list[ServiceOut])
async def list_services(db: AsyncSession = Depends(get_db)) -> list[Service]:
    result = await db.execute(
        select(Service)
        .where(Service.is_published.is_(True))
        .order_by(Service.sort_order.asc(), Service.id.asc())
    )
    return list(result.scalars().all())
