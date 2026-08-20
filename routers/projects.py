from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.user import User
from models.skill import Skill
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from utils.auth import get_current_user


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.post("/", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_project = Project(
        title=project.title,
        description=project.description,
        github_url=project.github_url,
        user_id=current_user.id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project

@router.post("/{project_id}/skills/{skill_id}")
def add_skill_to_project(
    project_id: int,
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    skill = db.query(Skill).filter(
        Skill.id == skill_id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    if skill in project.skills:
        raise HTTPException(
            status_code=400,
            detail="Skill already added to project"
        )

    project.skills.append(skill)

    db.commit()

    return {
        "message": "Skill added to project successfully"
    }


@router.get("/{project_id}/skills")
def get_project_skills(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project.skills


@router.delete("/{project_id}/skills/{skill_id}")
def remove_skill_from_project(
    project_id: int,
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    skill = db.query(Skill).filter(
        Skill.id == skill_id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    if skill not in project.skills:
        raise HTTPException(
            status_code=404,
            detail="Skill not added to project"
        )

    project.skills.remove(skill)

    db.commit()

    return {
        "message": "Skill removed from project successfully"
    }


@router.get("/", response_model=list[ProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .all()
    )

    return projects


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project_in_db = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project_in_db:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    if project_in_db.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to update this project"
        )

    project_in_db.title = project.title
    project_in_db.description = project.description
    project_in_db.github_url = project.github_url

    db.commit()
    db.refresh(project_in_db)

    return project_in_db

@router.get("/search")
def search_projects_by_skill(
    skill: str,
    db: Session = Depends(get_db)
):
    projects = (
        db.query(Project)
        .join(Project.skills)
        .filter(Skill.name.ilike(skill))
        .all()
    )

    return projects

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()

    return {"message": "Project deleted successfully"}