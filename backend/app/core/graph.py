import json
import logging
from typing import TypedDict, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END
from app.core.prompts import SYSTEM_PROMPT, load_json
from app.core.tools import TOOL_DEFINITIONS, execute_tool_async
from app.core.llm import deepseek_client

logger = logging.getLogger("uvicorn.error")

class AgentState(TypedDict):
    session_id: str
    visitor_name: Optional[str]
    user_message: str
    chat_history: List[Dict[str, str]]
    # Agent 1 (Researcher / Router) Outputs
    needs_tools: bool
    tool_calls: List[Dict[str, Any]]
    research_context: str
    card_type: Optional[str]
    card_data: Optional[Any]
    # Agent 2 (Persona Formatter) Output
    formatter_messages: List[Dict[str, str]]
    final_text: str

async def researcher_node(state: AgentState) -> Dict[str, Any]:
    """
    Agent 1 (Research & Router Agent):
    Evaluates the visitor's query against Mohmed's portfolio knowledge.
    Decides whether tool invocation (GitHub scraping, project knowledge lookup, or card display)
    is needed, executes tools, and compiles findings into a comprehensive research payload.
    """
    user_msg = state["user_message"]
    history = state.get("chat_history", [])

    # Prepare messages for Agent 1 router
    router_messages = [
        {"role": "system", "content": SYSTEM_PROMPT + "\n\nTASK FOR AGENT 1: Analyze user question. If they ask about any technology, framework, project, repo, or details, decide the exact tools to invoke (or scrape GitHub). If no tools are required, synthesize direct portfolio knowledge."},
        *history,
        {"role": "user", "content": user_msg}
    ]

    needs_tools = False
    tool_calls_executed = []
    card_type = None
    card_data = None
    research_notes = []

    # Check for direct keyword triggers for live scraping or deep knowledge
    msg_lower = user_msg.lower()
    
    # 1. Check if user is asking about LangGraph or LeapSQL
    if "langgraph" in msg_lower or "leapsql" in msg_lower or "sql" in msg_lower and "agent" in msg_lower:
        pk = execute_tool_async("search_project_knowledge", {"project_id": "leapsql-ai"})
        pk_res = await pk
        research_notes.append(f"Technical Project Knowledge for LeapSQL-AI:\n{json.dumps(pk_res.get('data', {}), indent=2)}")
        
        # Scrape live GitHub info for LeapSQL
        gh = await execute_tool_async("scrape_github_repository", {"repo_name": "LeepSQL-AI"})
        gh_data = gh.get("data", {})
        if gh_data.get("readme_summary"):
            research_notes.append(f"Live GitHub README for LeapSQL-AI:\n{gh_data['readme_summary'][:1500]}")
        
        # Attach LeapSQL Project Detail Card
        pd = await execute_tool_async("show_project_details", {"project_id": "leapsql-ai"})
        card_type = pd.get("card_type")
        card_data = pd.get("data")
        needs_tools = True

    # 2. Check if user is asking about CleaniSense / Google Hackathon
    elif "cleanisense" in msg_lower or "hackathon" in msg_lower or "civic" in msg_lower:
        pk = await execute_tool_async("search_project_knowledge", {"project_id": "cleanisense"})
        research_notes.append(f"Technical Knowledge for CleaniSense:\n{json.dumps(pk.get('data', {}), indent=2)}")
        
        pd = await execute_tool_async("show_project_details", {"project_id": "cleanisense"})
        card_type = pd.get("card_type")
        card_data = pd.get("data")
        needs_tools = True

    # 3. Check if user is asking about Meeting Assistant / RAG / Qdrant
    elif "meeting" in msg_lower or "qdrant" in msg_lower or "rag" in msg_lower:
        pk = await execute_tool_async("search_project_knowledge", {"project_id": "ai-meeting-assistant"})
        research_notes.append(f"Technical Knowledge for AI Meeting Assistant:\n{json.dumps(pk.get('data', {}), indent=2)}")
        
        pd = await execute_tool_async("show_project_details", {"project_id": "ai-meeting-assistant"})
        card_type = pd.get("card_type")
        card_data = pd.get("data")
        needs_tools = True

    # 4. Check if user is asking about Trading / Celery / WebSockets
    elif "trading" in msg_lower or "celery" in msg_lower or "stock" in msg_lower or "alert" in msg_lower:
        pk = await execute_tool_async("search_project_knowledge", {"project_id": "trading-alert-system"})
        research_notes.append(f"Technical Knowledge for Trading Alert System:\n{json.dumps(pk.get('data', {}), indent=2)}")
        
        gh = await execute_tool_async("scrape_github_repository", {"repo_name": "Primetrade.ai"})
        gh_data = gh.get("data", {})
        if gh_data.get("readme_summary"):
            research_notes.append(f"Live GitHub README for Trading System:\n{gh_data['readme_summary'][:1500]}")
            
        pd = await execute_tool_async("show_project_details", {"project_id": "trading-alert-system"})
        card_type = pd.get("card_type")
        card_data = pd.get("data")
        needs_tools = True

    # 5. Check if user is asking for general projects
    elif any(k in msg_lower for k in ["show me your projects", "featured projects", "what have you built", "projects"]):
        p_res = await execute_tool_async("show_projects", {"featured_only": True})
        card_type = p_res.get("card_type")
        card_data = p_res.get("data")
        research_notes.append("User requested overview of featured projects.")
        needs_tools = True

    # 6. Check for contact / hire
    elif any(k in msg_lower for k in ["contact", "email", "reach", "hire", "linkedin"]):
        c_res = await execute_tool_async("show_contact_card", {})
        card_type = c_res.get("card_type")
        card_data = c_res.get("data")
        research_notes.append("User requested contact information.")
        needs_tools = True

    # 7. Check for skills
    elif any(k in msg_lower for k in ["skill", "skills", "tech stack"]):
        s_res = await execute_tool_async("show_skills", {})
        card_type = s_res.get("card_type")
        card_data = s_res.get("data")
        research_notes.append("User requested technical skills overview.")
        needs_tools = True

    research_context = "\n\n".join(research_notes)
    if not research_context:
        research_context = "Direct conversation inquiry. Synthesize authentic answer from portfolio context."

    return {
        "needs_tools": needs_tools,
        "tool_calls": tool_calls_executed,
        "research_context": research_context,
        "card_type": card_type,
        "card_data": card_data
    }

async def formatter_node(state: AgentState) -> Dict[str, Any]:
    """
    Agent 2 (Synthesis & Persona Formatter Agent):
    Consumes Agent 1's research context and user query.
    Generates a charismatic, technically thorough, first-person answer as Mohmed Husain,
    explaining concepts first, connecting to real implementation learnings,
    and cleanly referencing accompanying UI cards.
    """
    user_msg = state["user_message"]
    history = state.get("chat_history", [])
    research_ctx = state.get("research_context", "")
    card_type = state.get("card_type")

    card_instruction = (
        f"A visual interactive card of type '{card_type}' will be displayed right below your message. "
        "Do NOT output raw JSON or code for the card. Instead, smoothly refer to it in your answer (e.g. 'I've linked the deep-dive project card below so you can inspect the architecture and code')."
        if card_type else "No card will be displayed. Provide a self-contained conversational response."
    )

    formatter_system_prompt = f"""{SYSTEM_PROMPT}

### AGENT 2 SPECIALIZED ROLE (PERSONA & SYNTHESIS FORMATTER):
You are synthesizing the final answer for the user based on verified research context gathered by Agent 1.

CRITICAL INSTRUCTIONS:
1. Speak in the first person ("I", "my") as Mohmed Husain Pasheriya.
2. If asked about a concept or technology (like LangGraph, FastAPI, RAG, PubMedBERT):
   - First explain the core concept thoroughly and articulately (*"Yeah, LangGraph is..."*).
   - Explain how and why you used it in your real production project (e.g. LeapSQL-AI).
   - Share specific architectural engineering learnings, design decisions, and real challenges you overcame.
3. {card_instruction}
4. Conclude with an engaging natural question or offer to discuss architectural details.

RESEARCH CONTEXT PROVIDED BY AGENT 1:
{research_ctx}
"""

    messages = [
        {"role": "system", "content": formatter_system_prompt},
        *history,
        {"role": "user", "content": user_msg}
    ]

    return {
        "formatter_messages": messages
    }

def create_multi_agent_graph():
    """Builds and compiles the 2-agent LangGraph workflow."""
    workflow = StateGraph(AgentState)
    
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("formatter", formatter_node)
    
    workflow.set_entry_point("researcher")
    workflow.add_edge("researcher", "formatter")
    workflow.add_edge("formatter", END)
    
    return workflow.compile()

multi_agent_graph = create_multi_agent_graph()
