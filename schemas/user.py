from pydantic import BaseModel
from schemas.skill import SkillResponse
from schemas.project import ProjectResponse

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

class ProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    skills: list[SkillResponse]
    projects: list[ProjectResponse]

    class Config:
        from_attributes = True