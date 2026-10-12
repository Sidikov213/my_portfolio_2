from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminUserOut(BaseModel):
    id: int
    email: EmailStr
    is_superuser: bool


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=6, max_length=128)


class ProfileAdminOut(BaseModel):
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
    resume_url: str | None = None


class ProfileAdminWrite(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    profession: str = ""
    specialization: str = ""
    slogan: str = ""
    bio: str = ""
    city: str = ""
    timezone: str = ""
    email: str = ""
    phone: str = ""
    telegram: str = ""
    github: str = ""
    linkedin: str = ""
    behance: str = ""
    dribbble: str = ""
    availability_status: str = ""
    is_available: bool = True
    resume_url: str | None = None


class ServiceAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    short_description: str
    scope: str
    stages: str
    timeline: str
    price_from: str
    sort_order: int
    is_published: bool


class ServiceAdminWrite(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str | None = None
    short_description: str = ""
    scope: str = ""
    stages: str = ""
    timeline: str = ""
    price_from: str = ""
    sort_order: int = 0
    is_published: bool = True
