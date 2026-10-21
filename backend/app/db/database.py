import logging
import asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from app.config import settings
from app.db.models import Base

logger = logging.getLogger("uvicorn.error")

engine = None
async_session_maker = None
current_db_type = "unknown"

def build_engine_and_session(url: str, is_pg: bool = False):
    connect_args = {}
    if is_pg:
        connect_args = {"ssl": "require"} if "ssl=require" in url else {}
        clean_url = url.split("?")[0]
        eng = create_async_engine(
            clean_url,
            echo=False,
            future=True,
            connect_args=connect_args,
            pool_pre_ping=True
        )
    else:
        eng = create_async_engine(url, echo=False, future=True)
    
    maker = async_sessionmaker(eng, expire_on_commit=False, class_=AsyncSession)
    return eng, maker

def init_engine():
    global engine, async_session_maker, current_db_type
    primary_url = settings.get_async_db_url()
    is_pg = "postgresql" in primary_url
    try:
        engine, async_session_maker = build_engine_and_session(primary_url, is_pg=is_pg)
        current_db_type = "postgresql" if is_pg else "sqlite"
    except Exception as e:
        logger.warning(f"Engine creation failed: {e}. Defaulting to SQLite.")
        engine, async_session_maker = build_engine_and_session(settings.FALLBACK_SQLITE_URL, is_pg=False)
        current_db_type = "sqlite"

init_engine()

async def init_db(reset: bool = False):
    """
    Initializes database tables.
    If reset=True, drops all tables first (cleaning previous project data).
    Falls back to SQLite if PostgreSQL connection fails.
    """
    global engine, async_session_maker, current_db_type
    
    async def try_create(active_engine):
        async with active_engine.begin() as conn:
            if reset:
                logger.info("Resetting database tables: dropping old tables...")
                await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

    try:
        # Wrap in timeout so DNS lookup failure doesn't hang
        await asyncio.wait_for(try_create(engine), timeout=5.0)
        logger.info(f"Database successfully connected & initialized with {current_db_type}")
    except Exception as e:
        logger.warning(f"Could not connect to {current_db_type} database ({e}).")
        if current_db_type != "sqlite":
            logger.info("Switching to local fallback SQLite database (local_agent.db)...")
            engine, async_session_maker = build_engine_and_session(settings.FALLBACK_SQLITE_URL, is_pg=False)
            current_db_type = "sqlite"
            await try_create(engine)
            logger.info("Fallback SQLite database created and initialized successfully.")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

