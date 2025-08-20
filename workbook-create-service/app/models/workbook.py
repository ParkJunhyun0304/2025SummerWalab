from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base


class Workbook(Base):
    """문제집 모델"""
    __tablename__ = "workbook"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey("public.user.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # 관계 설정
    creator = relationship("User", back_populates="workbooks")
    problems = relationship("WorkbookProblem", back_populates="workbook")


class WorkbookProblem(Base):
    """문제집에 포함된 문제 모델"""
    __tablename__ = "workbook_problem"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    workbook_id = Column(Integer, ForeignKey("public.workbook.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("public.problem.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    workbook = relationship("Workbook", back_populates="problems")
    problem = relationship("Problem")
