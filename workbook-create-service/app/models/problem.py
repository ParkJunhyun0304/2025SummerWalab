from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from app.config.database import Base


class Problem(Base):
    """OnlineJudge Problem 모델과 동일한 구조"""
    __tablename__ = "problem"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    input_description = Column(Text)
    output_description = Column(Text)
    samples = Column(Text)
    hint = Column(Text)
    source = Column(String(200))
    time_limit = Column(Integer, nullable=False)
    memory_limit = Column(Integer, nullable=False)
    difficulty = Column(String(20))
    is_public = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("public.user.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
