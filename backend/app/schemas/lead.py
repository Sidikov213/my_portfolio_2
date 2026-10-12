from datetime import datetime

from pydantic import BaseModel, Field


class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    contact: str = Field(min_length=1, max_length=255)
    company: str = ""
    project_type: str = ""
    description: str = ""
    budget: str = ""
    timeline: str = ""


class LeadOut(BaseModel):
    id: int
    status: str
    message: str = "Заявка принята"


class LeadAdminOut(BaseModel):
    id: int
    name: str
    contact: str
    company: str
    project_type: str
    description: str
    budget: str
    timeline: str
    status: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class LeadStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|in_progress|done|archived)$")
