import json
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

def load_data(filename: str):
    p = DATA_DIR / filename
    if p.exists():
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

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

    elif tool_name == "ask_visitor_followup":
        return {
            "card_type": "question_card",
            "data": {
                "question": arguments.get("question", "What would you like to explore next?"),
                "options": arguments.get("options", ["View Projects", "Ask about AI Experience", "Get in Touch"])
            }
        }

    return {"card_type": "generic", "data": {"message": f"Tool {tool_name} executed"}}
