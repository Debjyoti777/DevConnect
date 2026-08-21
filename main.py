import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from routers.health import router as health_router
from routers.users import router as users_router
from routers.auth import router as auth_router
from routers.projects import router as projects_router
from routers.skills import router as skills_router


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI(
    title="DevConnect API",
    description="Developer networking and project discovery REST API",
    version="1.0.0"
)


@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):
    logger.error(
        f"Unexpected error on {request.url}: {exc}"
    )

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


@app.get("/", tags=["Health"])
def root():
    return {"message": "Welcome to DevConnect API"}


app.include_router(health_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(skills_router)

logger.info("DevConnect API started")