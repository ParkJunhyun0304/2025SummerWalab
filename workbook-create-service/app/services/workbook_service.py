from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.workbook import Workbook, WorkbookProblem
from app.models.user import User
from app.schemas.workbook import WorkbookCreate, WorkbookUpdate, WorkbookProblemCreate
from typing import List, Optional


class WorkbookService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_workbook(self, workbook_data: WorkbookCreate, creator_id: int) -> Workbook:
        """문제집 생성"""
        workbook = Workbook(
            title=workbook_data.title,
            description=workbook_data.description,
            is_public=workbook_data.is_public,
            creator_id=creator_id
        )
        self.db.add(workbook)
        await self.db.commit()
        await self.db.refresh(workbook)
        return workbook
    
    async def get_workbook(self, workbook_id: int) -> Optional[Workbook]:
        """문제집 조회"""
        result = await self.db.execute(
            select(Workbook).where(Workbook.id == workbook_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_workbooks(self, user_id: int) -> List[Workbook]:
        """사용자의 문제집 목록 조회"""
        result = await self.db.execute(
            select(Workbook).where(Workbook.creator_id == user_id)
        )
        return result.scalars().all()
    
    async def get_public_workbooks(self) -> List[Workbook]:
        """공개 문제집 목록 조회"""
        result = await self.db.execute(
            select(Workbook).where(Workbook.is_public == True)
        )
        return result.scalars().all()
    
    async def update_workbook(self, workbook_id: int, workbook_data: WorkbookUpdate) -> Optional[Workbook]:
        """문제집 수정"""
        workbook = await self.get_workbook(workbook_id)
        if not workbook:
            return None
        
        update_data = workbook_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(workbook, field, value)
        
        await self.db.commit()
        await self.db.refresh(workbook)
        return workbook
    
    async def delete_workbook(self, workbook_id: int) -> bool:
        """문제집 삭제"""
        workbook = await self.get_workbook(workbook_id)
        if not workbook:
            return False
        
        await self.db.delete(workbook)
        await self.db.commit()
        return True
    
    async def add_problem_to_workbook(self, workbook_id: int, problem_data: WorkbookProblemCreate) -> Optional[WorkbookProblem]:
        """문제집에 문제 추가"""
        workbook = await self.get_workbook(workbook_id)
        if not workbook:
            return None
        
        workbook_problem = WorkbookProblem(
            workbook_id=workbook_id,
            problem_id=problem_data.problem_id,
            order_index=problem_data.order_index
        )
        self.db.add(workbook_problem)
        await self.db.commit()
        await self.db.refresh(workbook_problem)
        return workbook_problem
    
    async def remove_problem_from_workbook(self, workbook_id: int, problem_id: int) -> bool:
        """문제집에서 문제 제거"""
        result = await self.db.execute(
            select(WorkbookProblem).where(
                WorkbookProblem.workbook_id == workbook_id,
                WorkbookProblem.problem_id == problem_id
            )
        )
        workbook_problem = result.scalar_one_or_none()
        if not workbook_problem:
            return False
        
        await self.db.delete(workbook_problem)
        await self.db.commit()
        return True
