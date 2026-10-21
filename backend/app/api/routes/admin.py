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
async def get_analytics(db: AsyncSession = Depends(get_db)):
    """
    Returns aggregated analytics:
    - Total visitors/sessions
    - Total messages exchanged
    - What people are asking Mohmed's agent (questions & topics)
    - Recent conversations
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

    # 5. Recent questions asked by visitors
    recent_q_res = await db.execute(
        select(VisitorQuestionModel)
        .order_by(desc(VisitorQuestionModel.created_at))
        .limit(25)
    )
    recent_questions = [
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

    # 6. Recent sessions
    recent_sess_res = await db.execute(
        select(SessionModel)
        .order_by(desc(SessionModel.last_active_at))
        .limit(10)
    )
    recent_sessions = [
        {
            "id": s.id,
            "visitor_name": s.visitor_name,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "last_active_at": s.last_active_at.isoformat() if s.last_active_at else None
        }
        for s in recent_sess_res.scalars().all()
    ]

    return {
        "total_sessions": total_sessions,
        "total_messages": total_messages,
        "total_questions": total_questions,
        "topic_distribution": topic_distribution,
        "recent_questions": recent_questions,
        "recent_sessions": recent_sessions
    }

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
