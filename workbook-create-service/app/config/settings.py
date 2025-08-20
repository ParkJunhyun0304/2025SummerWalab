from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://onlinejudge:onlinejudge@localhost:5432/onlinejudge"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # SSO Configuration
    sso_introspect_url: str = "http://localhost:8000/api/sso/introspect"
    
    # Session Configuration
    redis_session_prefix: str = "wcs_session"
    local_token_cookie_name: str = "wcs_token"
    local_token_ttl_seconds: int = 1800
    
    # CORS
    allowed_origins: List[str] = ["*"]
    
    # FastAPI kwargs
    @property
    def fastapi_kwargs(self):
        return {
            "title": "Workbook Create Service",
            "description": "문제집 생성 마이크로 서비스",
            "version": "1.0.0"
        }
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
