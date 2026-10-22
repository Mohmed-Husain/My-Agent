import json
import time
import base64
import logging
from pathlib import Path
from typing import Any
import httpx
from app.config import settings

logger = logging.getLogger("uvicorn.error")

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

# In-memory GitHub cache: repo_key -> (timestamp, data)
_GITHUB_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
CACHE_TTL_SECONDS = 900  # 15 minutes

def load_data(filename: str):
    p = DATA_DIR / filename
    if p.exists():
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

import re

# Strict repo name regex: letters, numbers, hyphens, dots, underscores only
VALID_REPO_PATTERN = re.compile(r"^[a-zA-Z0-9_\-\.]+$")

async def fetch_github_repo_details(repo_name: str, include_readme: bool = True, include_tree: bool = True) -> dict[str, Any]:
    """
    Scrapes and fetches live repository metadata, README content, and file structures from GitHub.
    Hardened with strict allowlist and regex validation to prevent SSRF and path traversal.
    Only allows access to repositories owned by Mohmed Husain (Mohmed-Husain).
    """
    clean_repo = repo_name.strip()
    
    # Strip URL prefixes if provided
    for prefix in ["https://github.com/", "http://github.com/", "github.com/"]:
        if clean_repo.lower().startswith(prefix):
            clean_repo = clean_repo[len(prefix):]
            break
            
    clean_repo = clean_repo.strip().strip("/")
    
    # Block URL schemes, ports, IP addresses, queries, and path traversals
    if any(blocked in clean_repo for blocked in [":", "@", "\\", "..", "?", "#", "localhost", "127.", "169.254"]):
        logger.warning(f"Blocked suspicious repo query: {repo_name}")
        return {"error": "Invalid repository name"}

    parts = [p for p in clean_repo.split("/") if p]
    if len(parts) == 1:
        owner = settings.GITHUB_USERNAME
        repo = parts[0]
    elif len(parts) == 2:
        owner = parts[0]
        repo = parts[1]
    else:
        logger.warning(f"Invalid repo format: {repo_name}")
        return {"error": "Invalid repository format"}

    # Strict Owner Allowlist: Only allow Mohmed Husain's GitHub repositories
    if owner.lower() != settings.GITHUB_USERNAME.lower():
        logger.warning(f"Blocked unauthorized GitHub owner access: {owner}")
        return {"error": f"Access restricted to {settings.GITHUB_USERNAME} repositories only"}

    # Strict Repo name validation
    if not VALID_REPO_PATTERN.match(repo):
        logger.warning(f"Blocked invalid repo characters: {repo}")
        return {"error": "Repository name contains invalid characters"}

    cache_key = f"{owner}/{repo}"
    now = time.time()
    if cache_key in _GITHUB_CACHE:
        cached_time, cached_data = _GITHUB_CACHE[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_data

    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "Mohmed-Husain-AI-Agent"}
    if settings.GITHUB_TOKEN and len(settings.GITHUB_TOKEN) > 5:
        headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"

    result: dict[str, Any] = {
        "repo": f"{owner}/{repo}",
        "description": "",
        "stars": 0,
        "forks": 0,
        "language": "",
        "readme_summary": "",
        "directory_structure": []
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            # 1. Fetch repo metadata
            repo_res = await client.get(f"https://api.github.com/repos/{owner}/{repo}", headers=headers)
            if repo_res.status_code == 200:
                repo_info = repo_res.json()
                result["description"] = repo_info.get("description") or ""
                result["stars"] = repo_info.get("stargazers_count", 0)
                result["forks"] = repo_info.get("forks_count", 0)
                result["language"] = repo_info.get("language") or ""
                result["topics"] = repo_info.get("topics", [])

            # 2. Fetch README
            if include_readme:
                readme_res = await client.get(f"https://api.github.com/repos/{owner}/{repo}/readme", headers=headers)
                if readme_res.status_code == 200:
                    readme_data = readme_res.json()
                    raw_content = readme_data.get("content", "")
                    encoding = readme_data.get("encoding", "")
                    if encoding == "base64" and raw_content:
                        try:
                            decoded = base64.b64decode(raw_content).decode("utf-8", errors="ignore")
                            # Truncate to first 2500 characters to keep prompt compact
                            result["readme_summary"] = decoded[:2500]
                        except Exception as decode_err:
                            logger.warning(f"Failed to decode README: {decode_err}")

            # 3. Fetch directory file structure
            if include_tree:
                contents_res = await client.get(f"https://api.github.com/repos/{owner}/{repo}/contents", headers=headers)
                if contents_res.status_code == 200:
                    items = contents_res.json()
                    if isinstance(items, list):
                        result["directory_structure"] = [
                            {"name": item.get("name"), "type": item.get("type"), "path": item.get("path")}
                            for item in items[:15]
                        ]

        _GITHUB_CACHE[cache_key] = (now, result)
        return result

    except Exception as e:
        logger.error(f"Error scraping GitHub for {owner}/{repo}: {e}")
        return {"repo": f"{owner}/{repo}", "error": str(e), "note": "Could not connect to GitHub API"}

# Tool definitions in OpenAI / DeepSeek function calling schema
TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "show_projects",
            "description": "Display structured portfolio project cards to the visitor. Use when asked about projects, work samples, or what Mohmed has built.",
            "parameters": {
                "type": "object",
                "properties": {
                    "featured_only": {
                        "type": "boolean",
                        "description": "If true, shows only featured top projects like CleaniSense, LeapSQL-AI, AI Meeting Assistant."
                    },
                    "category": {
                        "type": "string",
                        "description": "Optional category filter like 'AI', 'Backend', 'Multi-Agent', or 'Civic Tech'."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_project_details",
            "description": "Display a deep-dive technical card for a specific project (e.g., cleanisense, leapsql-ai, ai-meeting-assistant, trading-alert-system).",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "The unique ID or name of the project."
                    }
                },
                "required": ["project_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_achievements",
            "description": "Display Mohmed's awards, honors, and hackathon wins (e.g., Google Hackathon 2nd Runner-Up, IEEE paper, Postman Expert).",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_experience",
            "description": "Display professional work experience timeline cards (Quba Infotech, IIIT Vadodara research, Glynac AI).",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_skills",
            "description": "Display structured technical skills categorized by Agentic AI, Backend Engineering, ML/NLP, and DevOps.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_github_repos",
            "description": "Display live public GitHub repositories with stars, descriptions, and language badges.",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Number of repositories to show (default 4)."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "show_contact_card",
            "description": "Display interactive contact information card with quick links to email, LinkedIn, GitHub, and portfolio.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "scrape_github_repository",
            "description": "Fetch live GitHub README and code directory layout for any of Mohmed's repositories (e.g. 'LeepSQL-AI', 'Primetrade.ai', 'NLP-summer-internship-').",
            "parameters": {
                "type": "object",
                "properties": {
                    "repo_name": {
                        "type": "string",
                        "description": "The repository name or URL on GitHub to scrape."
                    }
                },
                "required": ["repo_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_project_knowledge",
            "description": "Look up deep technical details, architectural decisions, and key engineering learnings about Mohmed's projects (e.g. LangGraph usage, 5-layer SQL firewall, K-Means clustering, PubMedBERT focal loss).",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "Project ID or topic (e.g. 'leapsql-ai', 'cleanisense', 'ai-meeting-assistant', 'trading-alert-system', 'clinical-nlp-research')."
                    }
                },
                "required": ["project_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "ask_visitor_followup",
            "description": "Ask the user an interactive multiple-choice question to personalize the conversation and keep them engaged.",
            "parameters": {
                "type": "object",
                "properties": {
                    "question": {
                        "type": "string",
                        "description": "The engaging question to display to the visitor."
                    },
                    "options": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of 2 to 4 clickable quick response options for the user."
                    }
                },
                "required": ["question", "options"]
            }
        }
    }
]

def execute_tool(tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """Executes local knowledge retrieval and returns structured card data."""
    if tool_name == "show_projects":
        projects = load_data("projects.json")
        featured_only = arguments.get("featured_only", False)
        category = arguments.get("category")
        
        filtered = projects
        if featured_only:
            filtered = [p for p in filtered if p.get("featured", False)]
        if category:
            filtered = [p for p in filtered if category.lower() in p.get("category", "").lower() or category.lower() in " ".join(p.get("tech_stack", [])).lower()]
            
        return {
            "card_type": "projects_list",
            "data": filtered[:4]
        }

    elif tool_name == "show_project_details":
        projects = load_data("projects.json")
        proj_id = arguments.get("project_id", "").lower()
        match = next((p for p in projects if p["id"].lower() == proj_id or proj_id in p["title"].lower()), None)
        if match:
            return {"card_type": "project_detail", "data": match}
        return {"card_type": "project_detail", "data": projects[0] if projects else {}}

    elif tool_name == "show_achievements":
        achievements = load_data("achievements.json")
        return {
            "card_type": "achievements_list",
            "data": achievements
        }

    elif tool_name == "show_experience":
        experience = load_data("experience.json")
        return {
            "card_type": "experience_list",
            "data": experience
        }

    elif tool_name == "show_skills":
        skills = load_data("skills.json")
        return {
            "card_type": "skills_matrix",
            "data": skills.get("categories", [])
        }

    elif tool_name == "show_github_repos":
        repos = load_data("repos.json")
        limit = arguments.get("limit", 4)
        return {
            "card_type": "repos_list",
            "data": repos[:limit]
        }

    elif tool_name == "show_contact_card":
        about = load_data("about.json")
        return {
            "card_type": "contact_card",
            "data": {
                "name": about.get("name", "Mohmed Husain Pasheriya"),
                "email": about.get("email", "mohmedhusain72@gmail.com"),
                "github": about.get("github", "https://github.com/Mohmed-Husain"),
                "linkedin": about.get("linkedin", "https://linkedin.com/in/mohmed-husain/"),
                "website": about.get("website", "https://mohmed-husain.in/"),
                "location": about.get("location", "Gujarat, India")
            }
        }

    elif tool_name == "search_project_knowledge":
        knowledge_list = load_data("project_knowledge.json")
        proj_id = arguments.get("project_id", "").lower()
        match = next(
            (k for k in knowledge_list if k["id"].lower() == proj_id or proj_id in k["title"].lower() or any(proj_id in t.lower() for t in k.get("tech_stack", []))),
            None
        )
        if match:
            return {"card_type": "project_knowledge", "data": match}
        return {"card_type": "project_knowledge", "data": knowledge_list[0] if knowledge_list else {}}

    elif tool_name == "scrape_github_repository":
        # Synchronous wrapper placeholder; actual async execution is in execute_tool_async
        return {"card_type": "github_scrape", "data": {"repo": arguments.get("repo_name", "")}}

    elif tool_name == "ask_visitor_followup":
        return {
            "card_type": "question_card",
            "data": {
                "question": arguments.get("question", "What would you like to explore next?"),
                "options": arguments.get("options", ["View Projects", "Ask about AI Experience", "Get in Touch"])
            }
        }

    return {"card_type": "generic", "data": {"message": f"Tool {tool_name} executed"}}

async def execute_tool_async(tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """Asynchronous tool execution supporting network-bound scraping."""
    if tool_name == "scrape_github_repository":
        repo_name = arguments.get("repo_name", "")
        scraped = await fetch_github_repo_details(repo_name)
        return {
            "card_type": "github_scrape",
            "data": scraped
        }
    return execute_tool(tool_name, arguments)
