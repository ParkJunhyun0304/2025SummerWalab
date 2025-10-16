import os
import sys
import shutil
import asyncio
import tempfile
from datetime import datetime
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import insert

from app.config.database import get_session
from app.problem.models import Problem, ProblemTag, problem_tags_association_table
from app.problem.json_problem_parser import ZIPJSONProblemParser
from app.problem.service import ProblemService
from app.problem.schemas import ProblemSchema, ProblemListResponse

router = APIRouter(
    prefix="/api/problem",
    tags=["Problem Management"]
)

TEST_CASE_BASE_PATH = os.getenv("TEST_CASE_DATA_PATH", "/app/test_cases_data")
os.makedirs(TEST_CASE_BASE_PATH, exist_ok=True)

@router.get("/", response_model=List[ProblemSchema])
async def get_all_problems(
    db: AsyncSession = Depends(get_session)
):
    problem_service = ProblemService(db)
    problems = await problem_service.get_all_problems()
    return problems

@router.post("", response_model=List[ProblemSchema])
async def import_problem(
        file: UploadFile = File(..., description="ZIP file containing JSON problem definitions"),
        db: AsyncSession = Depends(get_session)
):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="유효하지 않은 파일 형식입니다. .zip 파일만 지원됩니다.")

    created_or_updated_problems = []
    created_or_updated_ids = []
    temp_zip_file_path = ""  

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as temp_zip_file:
            shutil.copyfileobj(file.file, temp_zip_file)
            temp_zip_file_path = temp_zip_file.name

        parser = ZIPJSONProblemParser(temp_zip_file_path, TEST_CASE_BASE_PATH)
        parsed_problems_data = parser.parse()
        for problem_data in parsed_problems_data:
            tag_objects = []
            for tag_name in problem_data.get('tags', []):
                result = await db.execute(select(ProblemTag).filter_by(name=tag_name))
                tag = result.scalar_one_or_none()
                if not tag:
                    tag = ProblemTag(name=tag_name)
                    db.add(tag)
                    await db.flush()
                tag_objects.append(tag)

            result = await db.execute(select(Problem).filter_by(_id=problem_data['_id']))
            problem_instance = result.scalar_one_or_none()

            if problem_data.get("rule_type") == "OI":
                test_case_score_list = problem_data.get("test_case_score") or []
                problem_data["total_score"] = sum(item.get("score", 0) for item in test_case_score_list)
            else:
                problem_data["total_score"] = 0

            data_for_db_without_is_public = {
                k: v for k, v in problem_data.items()
                if k not in ['tags', 'id', 'create_time', 'last_update_time', 'is_public']
            }
            data_for_db_without_is_public['created_by_id'] = 1  # 임시 사용자 ID
            data_for_db_without_is_public['last_update_time'] = datetime.now()

            if problem_instance:
                for key, value in data_for_db_without_is_public.items():
                    setattr(problem_instance, key, value)
                problem_instance.is_public = problem_data.get('is_public', False)
            else:
                data_for_db_without_is_public['create_time'] = datetime.now()
                problem_instance = Problem(**data_for_db_without_is_public)
                db.add(problem_instance)

            await db.flush()

            if problem_instance and tag_objects:
                await db.execute(
                    problem_tags_association_table.delete().where(
                        problem_tags_association_table.c.problem_id == problem_instance.id
                    )
                )
                if tag_objects:
                    await db.execute(
                        insert(problem_tags_association_table).values([
                            {'problem_id': problem_instance.id, 'problemtag_id': tag.id} for tag in tag_objects
                        ])
                    )
            
            created_or_updated_problems.append(problem_instance)
            if problem_instance and problem_instance.id:
                created_or_updated_ids.append(problem_instance.id)

        await db.commit()

        if created_or_updated_ids:
            result = await db.execute(
                select(Problem)
                .options(selectinload(Problem.tags))
                .where(Problem.id.in_(created_or_updated_ids))
                .order_by(Problem.id)
            )
            created_or_updated_problems = result.scalars().all()

    except ValueError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"ZIP/JSON Parsing error : {str(e)}")
    except Exception as e:
        await db.rollback() 
        raise HTTPException(status_code=500, detail=f"error: {str(e)}")
    finally:
        if os.path.exists(temp_zip_file_path):
            os.remove(temp_zip_file_path)
        await file.close()

    return created_or_updated_problems

# 문제 필터 및 카운트에 필요한 api들

# 태그별 문제수 조회할 때 필요한거
@router.get("/tags/counts")
async def get_tag_count(db: AsyncSession = Depends(get_session)):
    service = ProblemService(db)
    return await service.get_tag_count()

# 태그 필터링, 정렬 한번에 묶어서
@router.get("/list", response_model=ProblemListResponse)
async def get_filter_sorted_problems(
    # 태그로 필털이할 때 태그값 받음
    tags : Optional[List[str]] = Query(None),
    # 정렬옵션 넣을 때 받을 변수, 기본값 : id
    sort_option : Optional[str] = Query("id"),
    # 오름, 내림차순 받을 변수, 기본은 오름차순
    order : Optional[str] = Query("asc"),
    # 페이지네이션 관련
    page : int = Query(1, ge = 1),
    page_size : int = Query(20, ge=1, le=250),
    db : AsyncSession = Depends(get_session)
):
    service = ProblemService(db)
    return await service.get_filter_sorted_problems(tags, sort_option, order, page, page_size)
