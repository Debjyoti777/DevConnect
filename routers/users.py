from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.skill import Skill
from models.project import Project
from schemas.user import UserCreate, UserResponse, ProfileResponse
from utils.auth import get_current_user
from utils.password import hash_password

router = APIRouter(tags=["Users"])


def user_data(user):
    return {"id": user.id, "name": user.name, "email": user.email}


def find_user(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/users", summary="Get all users")
def get_users(db: Session = Depends(get_db)):
    return [user_data(user) for user in db.query(User).all()]


@router.post("/users", response_model=UserResponse, status_code=201, summary="Create user")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/users/search", summary="Search developers by skill")
def search_users_by_skill(skill: str, db: Session = Depends(get_db)):
    term = skill.strip()
    if not term:
        return []

    pattern = f"%{term}%"
    users = (
        db.query(User)
        .filter(
            or_(
                User.skills.any(Skill.name.ilike(pattern)),
                User.projects.any(
                    Project.skills.any(Skill.name.ilike(pattern))
                )
            )
        )
        .distinct()
        .all()
    )
    return [user_data(user) for user in users]


@router.get("/users/me", response_model=ProfileResponse, summary="Get current user")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users/{user_id}", response_model=UserResponse, summary="Get user")
def get_user(user_id: int, db: Session = Depends(get_db)):
    return find_user(user_id, db)


@router.put("/users/{user_id}", response_model=UserResponse, summary="Update user")
def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db)):
    existing = find_user(user_id, db)

    existing.name = user.name
    existing.email = user.email
    existing.password = hash_password(user.password)

    db.commit()
    db.refresh(existing)
    return existing


@router.delete("/users/{user_id}", summary="Delete user")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = find_user(user_id, db)
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


@router.post("/me/skills/{skill_id}", summary="Add skill to current user")
def add_skill_to_user(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()

    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    if skill in current_user.skills:
        raise HTTPException(status_code=400, detail="Skill already added")

    current_user.skills.append(skill)
    db.commit()
    return {"message": "Skill added successfully"}


@router.get("/me/skills", summary="Get current user's skills")
def get_my_skills(current_user: User = Depends(get_current_user)):
    return current_user.skills


@router.delete("/me/skills/{skill_id}", summary="Remove skill from current user")
def remove_skill_from_user(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()

    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    if skill not in current_user.skills:
        raise HTTPException(
            status_code=404,
            detail="Skill not added to your profile"
        )

    current_user.skills.remove(skill)
    db.commit()
    return {"message": "Skill removed successfully"}