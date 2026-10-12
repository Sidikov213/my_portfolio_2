from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadOut
from app.services.telegram import LeadNotifyPayload, notify_new_lead

router = APIRouter()


@router.post("", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
async def create_lead(
    payload: LeadCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> LeadOut:
    lead = Lead(**payload.model_dump())
    db.add(lead)
    await db.commit()
    await db.refresh(lead)

    background_tasks.add_task(
        notify_new_lead,
        LeadNotifyPayload(
            name=lead.name,
            contact=lead.contact,
            company=lead.company,
            project_type=lead.project_type,
            description=lead.description,
            budget=lead.budget,
            timeline=lead.timeline,
        ),
    )

    return LeadOut(id=lead.id, status=lead.status)
