import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Prodigy Infotech - Employee Management System"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    
    # JWT & Auth
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "prodigy_infotech_task2_secure_jwt_secret_key_change_in_production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # Default Admin Credentials for initial setup
    ADMIN_DEFAULT_EMAIL: str = os.getenv("ADMIN_DEFAULT_EMAIL", "admin@prodigy.com")
    ADMIN_DEFAULT_PASSWORD: str = os.getenv("ADMIN_DEFAULT_PASSWORD", "AdminPassword@2026")
    
    # Admin Security Code
    ADMIN_SECRET_CODE: str = os.getenv("ADMIN_SECRET_CODE", "PRODIGY@2026")

    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()
