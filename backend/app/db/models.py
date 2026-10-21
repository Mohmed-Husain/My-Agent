import uuid
from datetime import datetime
from typing import Optional, Any
from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    visitor_name = Column(String(128), nullable=True)
    visitor_role = Column(String(128), nullable=True)  # Recruiter, Developer, Founder, etc.
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    messages = relationship("MessageModel", back_populates="session", cascade="all, delete-orphan", order_by="MessageModel.created_at")
    questions = relationship("VisitorQuestionModel", back_populates="session", cascade="all, delete-orphan")

class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    session_id = Column(String(64), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(32), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    cards = Column(JSON, nullable=True, default=list)  # structured card payload
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="messages")

class VisitorQuestionModel(Base):
    __tablename__ = "visitor_questions"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    session_id = Column(String(64), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=True, index=True)
    question = Column(Text, nullable=False)
    topic = Column(String(64), nullable=True)  # project, skill, experience, contact, hire, other
    visitor_name = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="questions")
