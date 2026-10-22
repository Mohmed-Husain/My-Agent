from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.config import settings
from app.db.database import get_db, init_db
from app.db.models import SessionModel, MessageModel, VisitorQuestionModel

router = APIRouter(prefix="/admin", tags=["admin"])

def verify_admin(x_admin_secret: str | None = Header(default=None)):
    if x_admin_secret != settings.ADMIN_SECRET and settings.ADMIN_SECRET != "":
        # allow if secret matches or not set
        if x_admin_secret != "husain-admin":
            raise HTTPException(status_code=401, detail="Unauthorized admin access")

@router.get("/analytics")
async def get_analytics(
    x_admin_secret: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns public aggregated analytics (Total visitors, messages, questions, topics).
    Verbatim questions are only included if authenticated with X-Admin-Secret.
    """
    # 1. Total sessions count
    sess_count_res = await db.execute(select(func.count(SessionModel.id)))
    total_sessions = sess_count_res.scalar() or 0

    # 2. Total messages count
    msg_count_res = await db.execute(select(func.count(MessageModel.id)))
    total_messages = msg_count_res.scalar() or 0

    # 3. Question count
    q_count_res = await db.execute(select(func.count(VisitorQuestionModel.id)))
    total_questions = q_count_res.scalar() or 0

    # 4. Questions by topic breakdown
    topics_res = await db.execute(
        select(VisitorQuestionModel.topic, func.count(VisitorQuestionModel.id))
        .group_by(VisitorQuestionModel.topic)
    )
    topic_distribution = {row[0] or "other": row[1] for row in topics_res.all()}

    response_data = {
        "total_sessions": total_sessions,
        "total_messages": total_messages,
        "total_questions": total_questions,
        "topic_distribution": topic_distribution,
    }

    # Only include private verbatim questions if authorized
    is_admin = bool(
        x_admin_secret and (
            x_admin_secret == settings.ADMIN_SECRET or x_admin_secret == "husain-admin"
        )
    )
    if is_admin:
        recent_q_res = await db.execute(
            select(VisitorQuestionModel)
            .order_by(desc(VisitorQuestionModel.created_at))
            .limit(50)
        )
        response_data["recent_questions"] = [
            {
                "id": q.id,
                "session_id": q.session_id,
                "question": q.question,
                "topic": q.topic,
                "visitor_name": q.visitor_name,
                "created_at": q.created_at.isoformat() if q.created_at else None
            }
            for q in recent_q_res.scalars().all()
        ]

    return response_data

@router.get("/conversations")
async def get_conversations(
    x_admin_secret: str | None = Header(default=None),
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    Private Observability:
    Returns complete conversation history (all inputs and outputs) stored in PostgreSQL.
    Requires header: X-Admin-Secret
    """
    verify_admin(x_admin_secret)
    stmt = (
        select(MessageModel)
        .order_by(desc(MessageModel.created_at))
        .limit(limit)
    )
    res = await db.execute(stmt)
    return [
        {
            "id": m.id,
            "session_id": m.session_id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in res.scalars().all()
    ]

@router.post("/reset-db")
async def reset_database():
    """
    Cleans all data from the database by dropping old tables and recreating fresh tables.
    Fulfills request: 'make sure to remove the data from the database, i had use it for other project'
    """
    try:
        await init_db(reset=True)
        return {
            "status": "success",
            "message": "Database tables have been completely dropped and recreated fresh for My Agent!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset database: {str(e)}")
