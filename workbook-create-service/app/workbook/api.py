from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.config.database import get_db
from app.user.dependencies import get_current_active_user
from app.user.models import User
from app.workbook.schemas import (
    Workbook, WorkbookCreate, WorkbookUpdate, 
    WorkbookProblemCreate, WorkbookProblem
)
from app.workbook.service import WorkbookService

router = APIRouter(prefix="/workbooks", tags=["workbooks"])


@router.post("/", response_model=Workbook)
async def create_workbook(
    workbook_data: WorkbookCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """문제집 생성"""
    workbook_service = WorkbookService(db)
    workbook = await workbook_service.create_workbook(workbook_data, current_user.id)
    return workbook


@router.get("/", response_model=List[Workbook])
async def get_workbooks(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """사용자의 문제집 목록 조회"""
    workbook_service = WorkbookService(db)
    workbooks = await workbook_service.get_user_workbooks(current_user.id)
    return workbooks


@router.get("/public", response_model=List[Workbook])
async def get_public_workbooks(
    db: AsyncSession = Depends(get_db)
):
    """공개 문제집 목록 조회"""
    workbook_service = WorkbookService(db)
    workbooks = await workbook_service.get_public_workbooks()
    return workbooks


@router.get("/{workbook_id}", response_model=Workbook)
async def get_workbook(
    workbook_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """문제집 상세 조회"""
    workbook_service = WorkbookService(db)
    workbook = await workbook_service.get_workbook(workbook_id)
    
    if not workbook:
        raise HTTPException(status_code=404, detail="Workbook not found")
    
    # 본인이 만든 문제집이거나 공개 문제집인 경우만 조회 가능
    if workbook.creator_id != current_user.id and not workbook.is_public:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return workbook


@router.put("/{workbook_id}", response_model=Workbook)
async def update_workbook(
    workbook_id: int,
    workbook_data: WorkbookUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """문제집 수정"""
    workbook_service = WorkbookService(db)
    workbook = await workbook_service.get_workbook(workbook_id)
    
    if not workbook:
        raise HTTPException(status_code=404, detail="Workbook not found")
    
    if workbook.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    updated_workbook = await workbook_service.update_workbook(workbook_id, workbook_data)
    return updated_workbook


@router.delete("/{workbook_id}")
async def delete_workbook(
    workbook_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """문제집 삭제"""
    workbook_service = WorkbookService(db)
    workbook = await workbook_service.get_workbook(workbook_id)
    
    if not workbook:
        raise HTTPException(status_code=404, detail="Workbook not found")
    
    if workbook.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    success = await workbook_service.delete_workbook(workbook_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete workbook")
    
    return {"message": "Workbook deleted successfully"}


@router.post("/{workbook_id}/problems", response_model=WorkbookProblem)
async def add_problem_to_workbook(
    workbook_id: int,
    problem_data: WorkbookProblemCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """문제집에 문제 추가"""
    workbook_service = WorkbookService(db)
    workbook = await workbook_service.get_workbook(workbook_id)
    
    if not workbook:
        raise HTTPException(status_code=404, detail="Workbook not found")
    
    if workbook.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    workbook_problem = await workbook_service.add_problem_to_workbook(workbook_id, problem_data)
    if not workbook_problem:
        raise HTTPException(status_code=500, detail="Failed to add problem to workbook")
    
    return workbook_problem


@router.delete("/{workbook_id}/problems/{problem_id}")
async def remove_problem_from_workbook(
    workbook_id: int,
    problem_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """문제집에서 문제 제거"""
    workbook_service = WorkbookService(db)
    workbook = await workbook_service.get_workbook(workbook_id)
    
    if not workbook:
        raise HTTPException(status_code=404, detail="Workbook not found")
    
    if workbook.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    success = await workbook_service.remove_problem_from_workbook(workbook_id, problem_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to remove problem from workbook")
    
    return {"message": "Problem removed from workbook successfully"}
