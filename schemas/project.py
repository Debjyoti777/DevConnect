from pydantic import BaseModel


class ProjectCreate(BaseModel):
    title: str
    description: str
    github_url: str | None = None


class ProjectUpdate(BaseModel):
    title: str
    description: str
    github_url: str | None = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    github_url: str | None
    user_id: int