from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.config.database import Base


# SQLAlchemy Models
class User(Base):
    __tablename__ = "user"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, autoincrement=True)
    password = Column(String(128), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    username = Column(Text, nullable=False, unique=True)
    email = Column(Text, nullable=True)
    create_time = Column(DateTime(timezone=True), nullable=True)
    admin_type = Column(Text, nullable=False)
    reset_password_token = Column(Text, nullable=True)
    reset_password_token_expire_time = Column(DateTime(timezone=True), nullable=True)
    auth_token = Column(Text, nullable=True)
    two_factor_auth = Column(Boolean, nullable=False)
    tfa_token = Column(Text, nullable=True)
    open_api = Column(Boolean, nullable=False)
    open_api_appkey = Column(Text, nullable=True)
    is_disabled = Column(Boolean, nullable=False)
    problem_permission = Column(Text, nullable=False)
    session_keys = Column(JSONB, nullable=False)

    # Relationship - 문자열로 참조하여 순환 import 방지
    workbooks = relationship("Workbook", back_populates="creator")
