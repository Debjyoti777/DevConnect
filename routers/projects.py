from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.user import User
from models.skill import Skill
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from utils.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


def get_owned_project(project_id: int, db: Session, user: User):
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def get_skill(skill_id: int, db: Session):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill


@router.post("/", response_model=ProjectResponse, summary="Create project")
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


@router.get("/public", summary="Get public projects")
def get_public_projects(db: Session = Depends(get_db)):
    projects = (
        db.query(Project, User)
        .join(User, Project.user_id == User.id)
        .all()
    )

    return [
        {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "github_url": project.github_url,
            "user_id": project.user_id,
            "user_name": user.name,
            "skills": [
                {"id": skill.id, "name": skill.name}
                for skill in project.skills
            ]
        }
        for project, user in projects
    ]


@router.get("/search", summary="Search projects by skill")
def search_projects_by_skill(skill: str, db: Session = Depends(get_db)):
    return (
        db.query(Project)
        .join(Project.skills)
        .filter(Skill.name.ilike(f"%{skill}%"))
        .all()
    )


@router.get("/", response_model=list[ProjectResponse], summary="Get my projects")
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .all()
    )


@router.post("/{project_id}/skills/{skill_id}", summary="Add skill to project")
def add_skill_to_project(
    project_id: int,
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_owned_project(project_id, db, current_user)
    skill = get_skill(skill_id, db)

    if skill in project.skills:
        raise HTTPException(status_code=400, detail="Skill already added to project")

    project.skills.append(skill)
    db.commit()
    return {"message": "Skill added to project successfully"}


@router.get("/{project_id}/skills", summary="Get project skills")
def get_project_skills(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_owned_project(project_id, db, current_user).skills


@router.delete("/{project_id}/skills/{skill_id}", summary="Remove skill from project")
def remove_skill_from_project(
    project_id: int,
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_owned_project(project_id, db, current_user)
    skill = get_skill(skill_id, db)

    if skill not in project.skills:
        raise HTTPException(status_code=404, detail="Skill not added to project")

    project.skills.remove(skill)
    db.commit()
    return {"message": "Skill removed from project successfully"}


@router.put("/{project_id}", response_model=ProjectResponse, summary="Update project")
def update_project(
    project_id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project_in_db = get_owned_project(project_id, db, current_user)

    project_in_db.title = project.title
    project_in_db.description = project.description
    project_in_db.github_url = project.github_url

    db.commit()
    db.refresh(project_in_db)
    return project_in_db


@router.delete("/{project_id}", summary="Delete project")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_owned_project(project_id, db, current_user)
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}