from fastapi import APIRouter
from app.core.tools import load_data

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

@router.get("/about")
async def get_about():
    return load_data("about.json")

@router.get("/projects")
async def get_projects():
    return load_data("projects.json")

@router.get("/achievements")
async def get_achievements():
    return load_data("achievements.json")

@router.get("/experience")
async def get_experience():
    return load_data("experience.json")

@router.get("/skills")
async def get_skills():
    return load_data("skills.json")

@router.get("/repos")
async def get_repos():
    return load_data("repos.json")
