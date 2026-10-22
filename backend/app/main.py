import sys
from pathlib import Path

# Ensure project root is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import logging
import re
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from app.config import settings
from app.db.database import init_db
from app.api.routes.chat import router as chat_router
from app.api.routes.portfolio import router as portfolio_router
from app.api.routes.admin import router as admin_router
from app.api.routes.health import router as health_router

logger = logging.getLogger("uvicorn.error")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist safely
    try:
        await init_db(reset=settings.RESET_DB_ON_STARTUP)
    except Exception as e:
        logger.error(f"Database initialization warning on startup: {e}")
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend orchestration service for Mohmed Husain's Digital Twin & Portfolio Agent.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for preview & production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def normalize_slashes(request: Request, call_next):
    # Normalize double slashes like '//api/v1/chat' -> '/api/v1/chat'
    if "//" in request.scope.get("path", ""):
        request.scope["path"] = re.sub(r"/+", "/", request.scope["path"])
    return await call_next(request)

# Mount Routers
app.include_router(health_router)
app.include_router(chat_router, prefix="/api/v1")
app.include_router(portfolio_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Mohmed Husain Pasheriya's AI Portfolio Agent API",
        "docs": "/docs",
        "health": "/health"
    }
