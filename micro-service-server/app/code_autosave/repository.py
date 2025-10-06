from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.code_autosave.models import ProblemCode


async def find_by_problem_id_and_username_and_language(
        problem_id: int,
        username: str,
        language: str,
        db: AsyncSession) -> Optional[ProblemCode]:
    stmt = (select(ProblemCode)
            .where(ProblemCode.problem_id == problem_id)
            .where(ProblemCode.username == username)
            .where(ProblemCode.language == language)
            )
    result = await db.execute(stmt)
    return result.scalars().one_or_none()
