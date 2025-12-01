from sqlalchemy import *
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.contest.models import Contest
from app.contest_user.models import ContestUser


async def get_participated_contest_by_user_id(user_id: int, db: AsyncSession) -> List[Contest]:
    result = await db.execute(select(Contest)
    .join(ContestUser, ContestUser.contest_id == Contest.id).where(
        ContestUser.user_id == user_id))
    return result.scalars().all()
