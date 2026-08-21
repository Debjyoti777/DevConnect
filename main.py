import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from routers.health import router as health_router
from routers.users import router as users_router
from routers.auth import router as auth_router
from routers.projects import router as projects_router
from routers.skills import router as skills_router


from models.user import User
from models.skill import Skill
from models.project import Project

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)


app = FastAPI()

logger.info("DevConnect API started")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):

    logger.error(
    f"Unexpected error on {request.url}: {exc}"
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error"
        }
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://dev-connect-5dzjrvqeq-dj-fccc.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message" : "Welcome to DevConnect API"}

app.include_router(health_router)

app.include_router(users_router)

app.include_router(auth_router)

app.include_router(projects_router)

app.include_router(skills_router)