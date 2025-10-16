from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, asc, desc, case, cast, Float
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from app.problem.models import Problem, ProblemTag, problem_tags_association_table
from app.problem.schemas import ProblemListResponse
from typing import List, Optional


class ProblemService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all_problems(self) -> List[Problem]:
        result = await self.db.execute(
            select(Problem)
            .options(selectinload(Problem.tags))
            .order_by(Problem.id)
        )
        return result.scalars().all()
    
    async def get_tag_count(self):
        stmt = (
            select(ProblemTag.name, func.count(problem_tags_association_table.c.problem_id))
            .join(problem_tags_association_table, ProblemTag.id == problem_tags_association_table.c.problemtag_id)
            .join(Problem, Problem.id == problem_tags_association_table.c.problem_id)
            .group_by(ProblemTag.name)
            .order_by(func.count(problem_tags_association_table.c.problem_id).desc())
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        # NOTE: 클라이언트에서 /api/problem/tag/counts 로 호출하므로 키 이름을 tag/count 로 고정합니다.
        return [{"tag": name, "count": count} for name, count in rows]

    async def get_filter_sorted_problems(
        self,
        # 태그로 필털이할 때 태그값 받음
        tags: Optional[List[str]],
        # 정렬옵션 넣을 때 받을 변수
        sort_option: Optional[str],
        # 오름, 내림차순 받을 변수
        order: Optional[str],
        # 페이지네이션 관련
        page: int,
        page_size: int,
    ) -> ProblemListResponse:
        accuracy_expression = case(
            (Problem.submission_number == 0, 0.0),
            else_=cast(Problem.accepted_number, Float) / cast(Problem.submission_number, Float)
        )

        valid_columns = {
            "id": Problem.id,
            "title": Problem.title,
            "difficulty": Problem.difficulty,
            "total_score": Problem.total_score,
            "create_time": Problem.create_time,
            "last_update_time": Problem.last_update_time,
            # NOTE: 전체 제출수/정답률 정렬에서 400이 발생한 원인은 컬럼 매핑 누락이었으므로 보완합니다.
            "submission": Problem.submission_number,
            "submission_count": Problem.submission_number,
            "accuracy": accuracy_expression,
            "accuracy_rate": accuracy_expression,
        }

        column = valid_columns.get(sort_option)
        if column is None:
            raise HTTPException(status_code=400, detail=f"Invalid sort_by parameter: {sort_option}")

        direction = (order or "asc").lower()
        ordering = desc(column) if direction == "desc" else asc(column)

        ## 쿼리부분 repo로 분리시키기
        # 기본 쿼리문 만듦
        stmt = select(Problem).options(selectinload(Problem.tags))

        # 기본 쿼리문에 태그 맞춰서 필터링 쿼리문으로 업데이트
        if tags and len(tags) > 0:
            stmt = (
                stmt.join(problem_tags_association_table, Problem.id == problem_tags_association_table.c.problem_id)
                .join(ProblemTag, ProblemTag.id == problem_tags_association_table.c.problemtag_id)
                .where(ProblemTag.name.in_(tags))
                .group_by(Problem.id)
                .having(func.count(func.distinct(ProblemTag.name)) == len(tags))
            )

        # 쿼리문에 정렬 필터 추가
        stmt = stmt.order_by(ordering)

        # 전체 개수 조회 (페이지네이션 total 계산용)
        count_stmt = select(func.count(func.distinct(Problem.id))).select_from(stmt.order_by(None).subquery())
        total_result = await self.db.execute(count_stmt)
        total_count = total_result.scalar() or 0

        # 페이지네이션
        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        problems = result.scalars().all()

        ## 함수로 이거 따로 빼기
        serialized = []
        for problem in problems:
            difficulty_value = problem.difficulty
            if not difficulty_value and isinstance(problem.statistic_info, dict):
                # NOTE: 난이도가 누락되는 문제를 보완하기 위해 statistic_info에 저장된 값을 활용합니다.
                difficulty_value = problem.statistic_info.get("difficulty")
            if isinstance(difficulty_value, (int, float)):
                mapping = {3: "상", 2: "중", 1: "하"}
                difficulty_value = mapping.get(int(difficulty_value), difficulty_value)
            elif isinstance(difficulty_value, str):
                standardized = difficulty_value.strip().upper()
                mapping = {
                    "HARD": "상",
                    "MID": "중",
                    "EASY": "하"
                }
                difficulty_value = mapping.get(standardized, difficulty_value.strip())

            serialized.append({
                "id": problem.id,
                "_id": problem._id,
                "title": problem.title,
                "description": problem.description,
                "time_limit": problem.time_limit,
                "memory_limit": problem.memory_limit,
                "create_time": problem.create_time,
                "last_update_time": problem.last_update_time,
                "created_by_id": problem.created_by_id,
                "rule_type": problem.rule_type,
                "visible": problem.visible,
                "difficulty": difficulty_value,
                "total_score": problem.total_score,
                "test_case_score": problem.test_case_score,
                "submission_number": problem.submission_number,
                "accepted_number": problem.accepted_number,
                "tags": [
                    {"id": tag.id, "name": tag.name}
                    for tag in (problem.tags or [])
                ],
            })

        return ProblemListResponse(
            total=total_count,
            page=page,
            page_size=page_size,
            problems=serialized,
        )
