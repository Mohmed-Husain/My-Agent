from fastapi import APIRouter
from app.config import settings
from app.db.database import current_db_type

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_type": current_db_type,
        "deepseek_configured": bool(settings.DEEPSEEK_API_KEY and len(settings.DEEPSEEK_API_KEY) > 5)
    }
