import json
import logging
from typing import AsyncGenerator, Any
import httpx
from app.config import settings
from app.core.tools import TOOL_DEFINITIONS, execute_tool

logger = logging.getLogger("uvicorn.error")

class DeepSeekClient:
    def __init__(self):
        self.api_key = settings.DEEPSEEK_API_KEY.strip()
        self.base_url = settings.DEEPSEEK_BASE_URL.rstrip("/")
        self.model = settings.DEEPSEEK_MODEL

    def is_configured(self) -> bool:
        return bool(self.api_key and not self.api_key.startswith("sk-placeholder") and len(self.api_key) > 5)

    async def stream_chat(
        self,
        messages: list[dict[str, Any]]
    ) -> AsyncGenerator[dict[str, Any], None]:
        """
        Streams response from DeepSeek Chat API with tool calling support.
        If no API key is set yet, falls back to an intelligent mock streaming mode.
        """
        if not self.is_configured():
            logger.info("DeepSeek API key not set or placeholder. Using intelligent portfolio fallback generator.")
            async for chunk in self._fallback_stream(messages):
                yield chunk
            return

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "tools": TOOL_DEFINITIONS,
            "tool_choice": "auto",
            "stream": True,
            "temperature": 0.6
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            try:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        logger.error(f"DeepSeek API error {response.status_code}: {error_text.decode('utf-8')}")
                        yield {"type": "text", "content": f"I had a slight hiccup connecting to my AI brain. Let me answer with my portfolio knowledge directly!"}
                        async for chunk in self._fallback_stream(messages):
                            yield chunk
                        return

                    tool_calls_accumulator = {}
                    has_streamed_text = False

                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        
                        raw = line[6:].strip()
                        if raw == "[DONE]":
                            break

                        try:
                            data = json.loads(raw)
                            choices = data.get("choices", [])
                            if not choices:
                                continue
                            delta = choices[0].get("delta", {})

                            # 1. Stream text tokens directly
                            if "content" in delta and delta["content"]:
                                has_streamed_text = True
                                yield {"type": "text", "content": delta["content"]}

                            # 2. Accumulate tool call chunks
                            if "tool_calls" in delta and delta["tool_calls"]:
                                for tc in delta["tool_calls"]:
                                    idx = tc.get("index", 0)
                                    if idx not in tool_calls_accumulator:
                                        tool_calls_accumulator[idx] = {
                                            "name": "",
                                            "arguments": ""
                                        }
                                    fn = tc.get("function", {})
                                    if "name" in fn and fn["name"]:
                                        tool_calls_accumulator[idx]["name"] += fn["name"]
                                    if "arguments" in fn and fn["arguments"]:
                                        tool_calls_accumulator[idx]["arguments"] += fn["arguments"]

                        except Exception as parse_err:
                            logger.debug(f"Stream parse warning: {parse_err}")

                    # If tools were invoked by DeepSeek, execute them now and yield cards
                    TOOL_INTROS = {
                        "show_projects": "Here are my featured projects and systems I've built:",
                        "show_project_details": "Here are the deep-dive architectural details for this project:",
                        "show_achievements": "Here are my honors, hackathon achievements, and milestones:",
                        "show_experience": "Here is an overview of my professional experience and research:",
                        "show_skills": "Here is a breakdown of my engineering skills and core tech stack:",
                        "show_github_repos": "Here are my active open-source repositories on GitHub:",
                        "show_contact_card": "I'd love to connect! Here is my direct contact information:"
                    }

                    for idx, tc in tool_calls_accumulator.items():
                        name = tc["name"]
                        args_str = tc["arguments"]
                        args = {}
                        try:
                            if args_str:
                                args = json.loads(args_str)
                        except Exception:
                            args = {}

                        logger.info(f"Executing tool call: {name} with args: {args}")
                        
                        # If no text was output by the model prior to the tool call, provide a clean intro
                        if not has_streamed_text and name in TOOL_INTROS:
                            intro_text = TOOL_INTROS[name]
                            yield {"type": "text", "content": intro_text}
                            has_streamed_text = True

                        card_result = execute_tool(name, args)
                        yield {
                            "type": "card",
                            "card_type": card_result.get("card_type"),
                            "data": card_result.get("data")
                        }

            except Exception as e:
                logger.error(f"Exception during DeepSeek stream: {e}")
                async for chunk in self._fallback_stream(messages):
                    yield chunk

    async def _fallback_stream(self, messages: list[dict[str, Any]]) -> AsyncGenerator[dict[str, Any], None]:
        """Intelligent fallback for instant testing when DeepSeek API key is pending or loading."""
        import asyncio
        last_user_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_user_msg = m.get("content", "").lower()
                break

        # Check intent
        if any(w in last_user_msg for w in ["project", "work", "build", "portfolio", "cleani", "leapsql", "meeting"]):
            intro = "Here are my featured projects! I specialize in Agentic AI, high-performance FastAPI backends, and multi-agent systems."
            for word in intro.split(" "):
                yield {"type": "text", "content": word + " "}
                await asyncio.sleep(0.02)
            
            card = execute_tool("show_projects", {"featured_only": True})
            yield {"type": "card", "card_type": card["card_type"], "data": card["data"]}

            followup = "\nWould you like me to dive deeper into any specific project, like the Google Hackathon winner CleaniSense or the 3-agent LeapSQL pipeline?"
            for word in followup.split(" "):
                yield {"type": "text", "content": word + " "}
                await asyncio.sleep(0.02)

            q_card = execute_tool("ask_visitor_followup", {
                "question": "Which project would you like to explore in detail?",
                "options": ["CleaniSense (Google Winner)", "LeapSQL-AI (Multi-Agent)", "AI Meeting Assistant", "Trading Alert System"]
            })
            yield {"type": "card", "card_type": q_card["card_type"], "data": q_card["data"]}

        elif any(w in last_user_msg for w in ["achievement", "award", "hackathon", "win", "honor", "ieee"]):
            intro = "I'm proud of several key milestones in AI and systems engineering! Here are my key achievements and honors:"
            for word in intro.split(" "):
                yield {"type": "text", "content": word + " "}
                await asyncio.sleep(0.02)

            card = execute_tool("show_achievements", {})
            yield {"type": "card", "card_type": card["card_type"], "data": card["data"]}

            q_card = execute_tool("ask_visitor_followup", {
                "question": "Would you like to hear about the Google Hackathon presentation in New Delhi?",
                "options": ["Tell me about Google Hackathon", "Show me GitHub Repos", "How can we connect?"]
            })
            yield {"type": "card", "card_type": q_card["card_type"], "data": q_card["data"]}

        elif any(w in last_user_msg for w in ["experience", "intern", "job", "quba", "glynac", "research"]):
            intro = "Here is an overview of my professional experience across AI backend engineering, research, and production microservices:"
            for word in intro.split(" "):
                yield {"type": "text", "content": word + " "}
                await asyncio.sleep(0.02)

            card = execute_tool("show_experience", {})
            yield {"type": "card", "card_type": card["card_type"], "data": card["data"]}

            q_card = execute_tool("ask_visitor_followup", {
                "question": "What role or topic are you hiring or looking for?",
                "options": ["AI Backend Engineer", "Agentic AI / LangGraph", "Fullstack / Cloud", "General Collaboration"]
            })
            yield {"type": "card", "card_type": q_card["card_type"], "data": q_card["data"]}

        elif any(w in last_user_msg for w in ["skill", "tech", "stack", "python", "langgraph", "fastapi"]):
            intro = "My core engineering expertise centers around Agentic AI systems, scalable backend infrastructure, and NLP research:"
            for word in intro.split(" "):
                yield {"type": "text", "content": word + " "}
                await asyncio.sleep(0.02)

            card = execute_tool("show_skills", {})
            yield {"type": "card", "card_type": card["card_type"], "data": card["data"]}

        elif any(w in last_user_msg for w in ["repo", "github", "code", "git"]):
            intro = "Here are some of my top public repositories on GitHub:"
            for word in intro.split(" "):
                yield {"type": "text", "content": word + " "}
                await asyncio.sleep(0.02)

            card = execute_tool("show_github_repos", {"limit": 4})
            yield {"type": "card", "card_type": card["card_type"], "data": card["data"]}

        elif any(w in last_user_msg for w in ["contact", "email", "reach", "hire", "linkedin", "message"]):
            intro = "I'd love to connect! You can reach me directly via email or LinkedIn:"
            for word in intro.split(" "):
                yield {"type": "text", "content": word + " "}
                await asyncio.sleep(0.02)

            card = execute_tool("show_contact_card", {})
            yield {"type": "card", "card_type": card["card_type"], "data": card["data"]}

        else:
            intro = f"Hello! I am Mohmed Husain's AI twin. I'm a 4th-year CS student at IIIT Vadodara and an AI Backend Engineer at Quba Infotech. What brings you to my portfolio today?"
            for word in intro.split(" "):
                yield {"type": "text", "content": word + " "}
                await asyncio.sleep(0.02)

            q_card = execute_tool("ask_visitor_followup", {
                "question": "What would you like to explore?",
                "options": ["Featured Projects", "Hackathons & Achievements", "Work Experience", "Get in Touch"]
            })
            yield {"type": "card", "card_type": q_card["card_type"], "data": q_card["data"]}

deepseek_client = DeepSeekClient()
