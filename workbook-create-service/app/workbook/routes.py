from fastapi import APIRouter, Depends, HTTPException
from app.workbook.service import WorkbookService
from app.workbook.schemas import WorkbookCreate, Workbook
from app.config.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/workbook", tags=["workbook"])


@router.post("/", response_model=Workbook)
async def create_workbook(
    workbook: WorkbookCreate,
    db: AsyncSession = Depends(get_session)
):
    """문제집 생성"""
    workbook_service = WorkbookService(db)
    return await workbook_service.create_workbook(workbook)


@router.get("/", response_model=list[Workbook])
async def get_workbooks(
    db: AsyncSession = Depends(get_session)
):
    """사용자의 문제집 목록 조회"""
    workbook_service = WorkbookService(db)
    return await workbook_service.get_user_workbooks(1)  # 하드코딩된 user_id=1


@router.get("/{workbook_id}", response_model=Workbook)
async def get_workbook(
    workbook_id: int,
    db: AsyncSession = Depends(get_session)
):
    """특정 문제집 조회"""
    workbook_service = WorkbookService(db)
    workbook = await workbook_service.get_workbook(workbook_id)
    if not workbook:
        raise HTTPException(status_code=404, detail="Workbook not found")
    return workbook


@router.put("/{workbook_id}", response_model=Workbook)
async def update_workbook(
    workbook_id: int,
    workbook: WorkbookCreate,
    db: AsyncSession = Depends(get_session)
):
    """문제집 수정"""
    workbook_service = WorkbookService(db)
    updated_workbook = await workbook_service.update_workbook(workbook_id, workbook)
    if not updated_workbook:
        raise HTTPException(status_code=404, detail="Workbook not found")
    return updated_workbook


@router.delete("/{workbook_id}")
async def delete_workbook(
    workbook_id: int,
    db: AsyncSession = Depends(get_session)
):
    """문제집 삭제"""
    workbook_service = WorkbookService(db)
    success = await workbook_service.delete_workbook(workbook_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workbook not found")
    return {"message": "Workbook deleted successfully"}
