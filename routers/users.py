from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.skill import Skill
from models.project import Project

from utils.auth import get_current_user

from schemas.user import UserCreate, UserResponse, ProfileResponse

from utils.password import hash_password


router = APIRouter()


@router.get("/users")
def get_users(
    db: Session = Depends(get_db)
):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
        for user in users
    ]


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=201
)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/search")
def search_users_by_skill(
    skill: str,
    db: Session = Depends(get_db)
):
    search_term = skill.strip()

    if not search_term:
        return []

    users = (
        db.query(User)
        .join(Project, Project.user_id == User.id)
        .join(Project.skills)
        .filter(
            Skill.name.ilike(f"%{search_term}%")
        )
        .distinct()
        .all()
    )

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
        for user in users
    ]    

# IMPORTANT:
# /users/me MUST come before /users/{user_id}

@router.get(
    "/users/me",
    response_model=ProfileResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.get(
    "/users/{user_id}",
    response_model=UserResponse
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


@router.put(
    "/users/{user_id}",
    response_model=UserResponse
)
def update_user(
    user_id: int,
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if existing_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_user.name = user.name
    existing_user.email = user.email
    existing_user.password = hash_password(
        user.password
    )

    db.commit()
    db.refresh(existing_user)

    return existing_user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }


@router.post("/me/skills/{skill_id}")
def add_skill_to_user(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = (
        db.query(Skill)
        .filter(Skill.id == skill_id)
        .first()
    )

    if skill is None:
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    if skill in current_user.skills:
        raise HTTPException(
            status_code=400,
            detail="Skill already added"
        )

    current_user.skills.append(skill)

    db.commit()

    return {
        "message": "Skill added successfully"
    }


@router.get("/me/skills")
def get_my_skills(
    current_user: User = Depends(get_current_user)
):
    return current_user.skills


@router.delete("/me/skills/{skill_id}")
def remove_skill_from_user(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = (
        db.query(Skill)
        .filter(Skill.id == skill_id)
        .first()
    )

    if skill is None:
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    if skill not in current_user.skills:
        raise HTTPException(
            status_code=404,
            detail="Skill not added to your profile"
        )

    current_user.skills.remove(skill)

    db.commit()

    return {
        "message": "Skill removed successfully"
    }