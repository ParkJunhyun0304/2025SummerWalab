from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class WorkbookBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_public: bool = False


class WorkbookCreate(WorkbookBase):
    pass


class WorkbookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


class WorkbookProblemBase(BaseModel):
    problem_id: int
    order_index: int


class WorkbookProblemCreate(WorkbookProblemBase):
    pass


class WorkbookProblem(WorkbookProblemBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class Workbook(WorkbookBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime
    problems: List[WorkbookProblem] = []
    
    class Config:
        from_attributes = True


class WorkbookWithProblems(Workbook):
    problems: List[WorkbookProblem] = []
