from fastapi import APIRouter

router = APIRouter()


@router.get(
    "/health",
    tags=["Health"],
    summary="Check API health"
)
def health_check():
    return {"status": "healthy"}