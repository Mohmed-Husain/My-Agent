import json
import logging
from typing import AsyncGenerator, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import SessionModel, MessageModel, VisitorQuestionModel
from app.core.prompts import SYSTEM_PROMPT
from app.core.llm import deepseek_client

logger = logging.getLogger("uvicorn.error")

def detect_question_topic(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["project", "cleanisense", "leapsql", "meeting", "build"]):
        return "projects"
    elif any(w in t for w in ["achievement", "award", "hackathon", "win", "ieee", "trophy"]):
        return "achievements"
    elif any(w in t for w in ["experience", "intern", "job", "quba", "glynac", "work"]):
        return "experience"
    elif any(w in t for w in ["skill", "python", "langgraph", "fastapi", "docker", "tech"]):
        return "skills"
    elif any(w in t for w in ["hire", "recruiter", "salary", "role", "available"]):
        return "hiring"
    elif any(w in t for w in ["contact", "email", "phone", "linkedin", "reach"]):
        return "contact"
    return "general"

class ConversationOrchestrator:
    async def process_chat(
        self,
        db: AsyncSession,
        session_id: str | None,
        user_message: str,
        visitor_name: str | None = None
    ) -> AsyncGenerator[str, None]:
        """
        Orchestrates session lookup/creation, conversation history,
        DeepSeek streaming, visitor question logging, and DB persistence.
        Yields raw SSE formatted lines: 'data: {...}\n\n'
        """
        user_message_clean = user_message.strip()

        # 1. Session management
        session = None
        if session_id:
            result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
            session = result.scalars().first()

        if not session:
            session = SessionModel(
                visitor_name=visitor_name,
                visitor_role=None,
                created_at=datetime.utcnow(),
                last_active_at=datetime.utcnow()
            )
            db.add(session)
            await db.commit()
            await db.refresh(session)
        else:
            session.last_active_at = datetime.utcnow()
            if visitor_name and not session.visitor_name:
                session.visitor_name = visitor_name
            await db.commit()

        active_session_id = session.id

        # 2. Record visitor question for analytics
        topic = detect_question_topic(user_message_clean)
        question_record = VisitorQuestionModel(
            session_id=active_session_id,
            question=user_message_clean,
            topic=topic,
            visitor_name=session.visitor_name or visitor_name,
            created_at=datetime.utcnow()
        )
        db.add(question_record)

        # 3. Save User message to DB
        user_db_msg = MessageModel(
            session_id=active_session_id,
            role="user",
            content=user_message_clean,
            cards=[],
            created_at=datetime.utcnow()
        )
        db.add(user_db_msg)
        await db.commit()

        # 4. Fetch past 8 messages for context
        history_result = await db.execute(
            select(MessageModel)
            .where(MessageModel.session_id == active_session_id)
            .order_by(MessageModel.created_at.desc())
            .limit(10)
        )
        past_msgs = list(reversed(history_result.scalars().all()))

        # Build prompt payload
        llm_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in past_msgs[:-1]:  # exclude the one we just added (added next)
            llm_messages.append({"role": m.role, "content": m.content})
        llm_messages.append({"role": "user", "content": user_message_clean})

        # 5. Stream from LLM & accumulate
        assistant_text_chunks = []
        collected_cards = []

        try:
            async for chunk in deepseek_client.stream_chat(llm_messages):
                chunk_type = chunk.get("type")
                if chunk_type == "text":
                    assistant_text_chunks.append(chunk.get("content", ""))
                elif chunk_type == "card":
                    collected_cards.append({
                        "card_type": chunk.get("card_type"),
                        "data": chunk.get("data")
                    })

                # Yield SSE chunk
                yield f"data: {json.dumps(chunk)}\n\n"

        except Exception as e:
            logger.error(f"Error during stream generation: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        # 6. Save Assistant response to DB
        full_assistant_reply = "".join(assistant_text_chunks).strip()
        asst_db_msg = MessageModel(
            session_id=active_session_id,
            role="assistant",
            content=full_assistant_reply or "(Shared portfolio cards)",
            cards=collected_cards,
            created_at=datetime.utcnow()
        )
        db.add(asst_db_msg)
        await db.commit()

        # 7. Send final done SSE signal
        done_payload = {
            "type": "done",
            "session_id": active_session_id,
            "cards_count": len(collected_cards)
        }
        yield f"data: {json.dumps(done_payload)}\n\n"

orchestrator = ConversationOrchestrator()
