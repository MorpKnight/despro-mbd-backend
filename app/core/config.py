from pydantic_settings import BaseSettings
from pydantic import AnyUrl
from typing import Optional
import os

class Settings(BaseSettings):
    # App
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    SEED_MASTER_ADMIN: bool = os.getenv("SEED_MASTER_ADMIN", "true").lower() in {"1","true","yes","on"}

    # CORS & Hosts
    CORS_WHITELIST: str = os.getenv("CORS_WHITELIST", "*")
    TRUSTED_HOSTS: str = os.getenv("TRUSTED_HOSTS", "*")

    # Database
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    DB_ENGINE: str = os.getenv("DB_ENGINE", "sqlite")  # sqlite or postgresql
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "mbg_dev")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "postgres")

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def sql_alchemy_database_uri(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        if self.DB_ENGINE == "postgresql":
            return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        # default sqlite file in project root
        return "sqlite:///./mbg_fastapi_dev.db"

settings = Settings()
