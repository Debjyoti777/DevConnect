from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)

    users = relationship(
        "User",
        secondary="user_skills",
        back_populates="skills"
    )

    projects = relationship(
        "Project",
        secondary="project_skills",
        back_populates="skills"
    )