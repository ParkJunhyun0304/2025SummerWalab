from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB

from app.config.database import Base


class Contest(Base):
    __tablename__ = "contest"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    real_time_rank = Column(Boolean, nullable=False)
    password = Column(Text, nullable=True)
    rule_type = Column(Text, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    create_time = Column(DateTime(timezone=True), nullable=False)
    last_update_time = Column(DateTime(timezone=True), nullable=False)
    visible = Column(Boolean, nullable=False)
    created_by_id = Column(Integer, ForeignKey("public.user.id"), nullable=False)
    allowed_ip_ranges = Column(JSONB, nullable=False)
