import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "Mohmed Husain - AI Portfolio Agent"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # DeepSeek LLM
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"
    DEEPSEEK_MODEL: str = "deepseek-flash"
    
    # Database
    DATABASE_URL: str = ""
    FALLBACK_SQLITE_URL: str = (
        "sqlite+aiosqlite:////tmp/local_agent.db"
        if os.environ.get("VERCEL")
        else "sqlite+aiosqlite:///./local_agent.db"
    )
    RESET_DB_ON_STARTUP: bool = False  # Set to True to clean tables
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "https://mohmed-husain.in",
        "*"
    ]
    
    # GitHub Integration
    GITHUB_USERNAME: str = "Mohmed-Husain"
    GITHUB_TOKEN: str = ""
    
    # Admin security
    ADMIN_SECRET: str = "husain-agent-secret-2026"
    
    # 4-Tier Rate Limiting & Abuse Prevention
    RATE_LIMIT_ENABLED: bool = False  # Set to True in production to enforce limits
    RATE_LIMIT_SESSION_MAX: int = 10  # 10 requests per window per session
    RATE_LIMIT_SESSION_WINDOW: int = 120  # 2 minutes window
    RATE_LIMIT_IP_MAX: int = 20  # 20 requests per window per IP
    RATE_LIMIT_IP_WINDOW: int = 120  # 2 minutes window
    RATE_LIMIT_GLOBAL_DAILY_BUDGET: int = 500  # 500 total LLM calls per day across all visitors
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def get_async_db_url(self) -> str:
        """Converts postgres:// or postgresql:// to postgresql+asyncpg:// with proper ssl query param"""
        url = self.DATABASE_URL.strip()
        if not url:
            return self.FALLBACK_SQLITE_URL
            
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            
        # asyncpg prefers ssl=... instead of sslmode=...
        if "sslmode=require" in url:
            url = url.replace("sslmode=require", "ssl=require")
        elif "sslmode=prefer" in url:
            url = url.replace("sslmode=prefer", "ssl=prefer")
            
        return url

settings = Settings()
