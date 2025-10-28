from sqlalchemy import UniqueConstraint, Column, ForeignKey, Integer, DateTime, func, String

from app.config.database import Base


class Organization(Base):
    __tablename__ = "micro_organization"
    __table_args__ = (
        UniqueConstraint('user_id', 'name', name='uq_micro_organization_user_name'),
        {"schema": "public"},
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    user_id = Column(ForeignKey("public.user.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column("created_time", DateTime(timezone=True), server_default=func.now())
    updated_at = Column("updated_time", DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Organization id={self.id} user_id={self.user_id} name={self.name!r}>"
