from sqlalchemy.ext.asyncio import AsyncSession

import app.contest.repository as contest_repo
from app.contest.schemas import ContestDTO
from app.user.schemas import UserData


async def get_participated_contest_by_user(user_date: UserData, db: AsyncSession):
    contests = await contest_repo.get_participated_contest_by_user_id(user_date.user_id, db)
    return [
        ContestDTO(
            contest_id=c.id,
            title=c.title,
            start_time=c.start_time,
            end_time=c.end_time,
        )
        for c in contests
    ]
    return None
