from typing import Iterable, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.submission import repository as submission_repo
from app.submission.schemas import ContestProblemStat, ContestUserScore


async def get_contest_problem_stats(
    contest_id: int,
    problem_ids: Optional[Iterable[int]],
    db: AsyncSession,
) -> List[ContestProblemStat]:
    stats = await submission_repo.fetch_contest_problem_stats(
        db,
        contest_id=contest_id,
        problem_ids=problem_ids,
    )
    return [ContestProblemStat(**item) for item in stats]


async def get_contest_user_scores(
    contest_id: int,
    db: AsyncSession,
) -> List[ContestUserScore]:
    scores = await submission_repo.fetch_contest_user_scores(
        db,
        contest_id=contest_id,
    )
    return [ContestUserScore(**item) for item in scores]
