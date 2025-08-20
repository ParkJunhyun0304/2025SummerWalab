from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
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


class Workbook(Base):
    """문제집 모델"""
    __tablename__ = "workbook"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    created_by_id = Column(Integer, ForeignKey("public.user.id"), nullable=False, default=1)
    # is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # 관계 설정 - 문자열로 참조하여 순환 import 방지
    creator = relationship("User", back_populates="workbooks", foreign_keys=[created_by_id])
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
    
    # 관계 설정 - 문자열로 참조하여 순환 import 방지
    workbook = relationship("Workbook", back_populates="problems")
    problem = relationship("Problem")
