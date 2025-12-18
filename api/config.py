""" 
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import os
from typing import Optional
from pydantic import Field
try:
    from pydantic_settings import BaseSettings
except ImportError:
    # Fallback for pydantic v1
    from pydantic import BaseSettings

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Clinic Intake & Triage System"
    VERSION: str = "0.2.0"
    API_PREFIX: str = "/api"
    ENV: str = Field(default="development", env="ENV")
    DEBUG: bool = Field(default=True, env="DEBUG")

    # Security and session
    SECRET_KEY: str = Field(default="YOUR_SECRET_KEY", env="SECRET_KEY")
    SESSION_EXPIRE_MINUTES: int = Field(default=60, env="SESSION_EXPIRE_MINUTES")
    TOKEN_EXPIRE_MINUTES: int = Field(default=20, env="TOKEN_EXPIRE_MINUTES")
    STAFF_PIN_LENGTH: int = Field(default=6, env="STAFF_PIN_LENGTH")
    SSO_MOCK: bool = Field(default=True, env="SSO_MOCK")
    SESSION_COOKIE_NAME: str = Field(default="clinic_session", env="SESSION_COOKIE_NAME")

    # Database (using SQLite for MVP, upgradeable to Postgres)
    SQLALCHEMY_DATABASE_URI: str = Field(default="sqlite:///./data/clinic.db", env="DATABASE_URL")
    DATABASE_CONNECT_RETRY: int = Field(default=5, env="DATABASE_CONNECT_RETRY")

    # Knowledge Pack Excel
    KNOWLEDGE_PACK_PATH: str = Field(default="data/knowledge_pack/clinical_knowledge_pack_prefilled_v02_with_questionnaire.xlsx", env="KNOWLEDGE_PACK_PATH")

    # Mock adapters for Neo4j and MemVerge
    MOCK_NEO4J: bool = Field(default=True, env="MOCK_NEO4J")
    MOCK_MEMVERGE: bool = Field(default=True, env="MOCK_MEMVERGE")
    
    # MemMachine configuration (when MOCK_MEMVERGE=False)
    MEMMACHINE_ENDPOINT: str = Field(default="http://memmachine:8081", env="MEMMACHINE_ENDPOINT")
    MEMMACHINE_API_KEY: Optional[str] = Field(default=None, env="MEMMACHINE_API_KEY")

    # Audit
    AUDIT_LOG_PATH: str = Field(default="data/audit.log", env="AUDIT_LOG_PATH")
    AUDIT_IMMUTABLE: bool = Field(default=True, env="AUDIT_IMMUTABLE")

    # Email/Communication (mocked for now)
    EMAIL_MOCK_SEND: bool = Field(default=True, env="EMAIL_MOCK_SEND")
    EMAIL_SENDER: str = Field(default="no-reply@igotnowifi.com", env="EMAIL_SENDER")

    # Frontend links
    FRONTEND_URL: str = Field(default="http://localhost:5173", env="FRONTEND_URL")

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Pydantic v2 compatibility
        extra = "ignore"

settings = Settings()