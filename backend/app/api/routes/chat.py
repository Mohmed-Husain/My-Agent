from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.db.models import SessionModel, MessageModel
from app.core.orchestrator import orchestrator
from app.core.rate_limiter import rate_limiter

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    visitor_name: str | None = None

@router.post("")
async def chat_endpoint(req: ChatRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """SSE Streaming chat endpoint with 4-tier rate limiting & structured card generation."""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # 4-Tier Rate Limiting evaluation
    allowed, reason, retry_after = rate_limiter.check_rate_limits(
        request=request,
        session_id=req.session_id
    )
    if not allowed:
        return JSONResponse(
            status_code=429,
            content={
                "detail": reason or "Too Many Requests",
                "retry_after": retry_after
            },
            headers={"Retry-After": str(retry_after)}
        )

    return StreamingResponse(
        orchestrator.process_chat(
            db=db,
            session_id=req.session_id,
            user_message=req.message,
            visitor_name=req.visitor_name
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch previous chat messages and cards for an active session."""
    sess_result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
    session = sess_result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    msgs_result = await db.execute(
        select(MessageModel)
        .where(MessageModel.session_id == session_id)
        .order_by(MessageModel.created_at.asc())
    )
    messages = msgs_result.scalars().all()

    return {
        "session_id": session.id,
        "visitor_name": session.visitor_name,
        "created_at": session.created_at,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "cards": m.cards or [],
                "created_at": m.created_at
            }
            for m in messages
        ]
    }
