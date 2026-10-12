from pydantic import BaseModel, ConfigDict


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    profession: str
    specialization: str
    slogan: str
    bio: str
    city: str
    timezone: str
    email: str
    phone: str
    telegram: str
    github: str
    linkedin: str
    behance: str
    dribbble: str
    availability_status: str
    is_available: bool
    resume_url: str | None
