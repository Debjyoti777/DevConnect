from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


user_skills = Table(
    "user_skills",
    Base.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("skill_id", ForeignKey("skills.id"), primary_key=True)
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)

    skills = relationship(
        "Skill",
        secondary=user_skills,
        back_populates="users"
    )

    projects= relationship("Project", back_populates="user")