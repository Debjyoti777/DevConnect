from fastapi import APIRouter, HTTPException
from schemas.user import UserCreate, UserResponse
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db


router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "healthy"}

@router.get("/test/users/{user_id}")
def get_test_user(user_id: int):
    return {"user_id": user_id}

@router.get("/test/search")
def search_users(skill: str):
    return {"skill": skill}

@router.post("/test/users")
def create_test_user(user: UserCreate):
    return user

@router.get("/test/response", response_model=UserResponse)
def test_response():
    return {
        "id": 1,
        "name": "Debjyoti",
        "email": "hello@gmail.com",
        "password": "This should NOT appear"
    }

@router.get("/test/error")
def test_error():
    raise HTTPException(
        status_code=404,
        detail="Test resource not found"
    )

@router.get("/test/db")
def test_db(db: Session = Depends(get_db)):
    return {
        "message": "Database dependency is working"
    }