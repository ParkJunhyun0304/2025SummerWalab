from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base


class User(Base):
    """OnlineJudge User 모델과 동일한 구조"""
    __tablename__ = "user"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    password = Column(String(128), nullable=False)
    last_login = Column(DateTime(timezone=True))
    username = Column(String, nullable=False, unique=True, index=True)
    email = Column(String)
    create_time = Column(DateTime(timezone=True), server_default=func.now())
    admin_type = Column(String, nullable=False)
    reset_password_token = Column(String)
    reset_password_token_expire_time = Column(DateTime(timezone=True))
    auth_token = Column(String)
    two_factor_auth = Column(Boolean, nullable=False, default=False)
    tfa_token = Column(String)
    open_api = Column(Boolean, nullable=False, default=False)
    open_api_appkey = Column(String)
    is_disabled = Column(Boolean, nullable=False, default=False)
    problem_permission = Column(String, nullable=False)
    session_keys = Column(JSONB, nullable=False, default={})
    
    # 관계 설정
    workbooks = relationship("Workbook", back_populates="creator")
