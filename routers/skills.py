from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.skill import Skill
from schemas.skill import SkillCreate, SkillResponse
from utils.auth import get_current_user

router = APIRouter(prefix="/skills", tags=["Skills"])


def find_skill(skill_id: int, db: Session):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill


@router.post("/", response_model=SkillResponse, summary="Create a skill")
def create_skill(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if db.query(Skill).filter(Skill.name == skill.name).first():
        raise HTTPException(status_code=400, detail="Skill already exists")

    new_skill = Skill(name=skill.name)
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill


@router.get("/", response_model=list[SkillResponse], summary="Get all skills")
def get_skills(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Skill).all()


@router.get("/{skill_id}", response_model=SkillResponse, summary="Get skill")
def get_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return find_skill(skill_id, db)