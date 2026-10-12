from pydantic import BaseModel, ConfigDict


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str


class ProjectListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    summary: str
    cover_url: str | None
    year: int | None
    role: str
    technologies: str
    is_featured: bool
    category: CategoryOut | None = None


class ProjectDetail(ProjectListItem):
    client_name: str
    content_blocks: str
