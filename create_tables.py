from database import engine, Base

from models.user import User
from models.skill import Skill
from models.project import Project

Base.metadata.create_all(bind=engine)

print("All tables created successfully!")