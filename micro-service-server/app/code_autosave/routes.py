from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_session
from app.security.deps import get_userdata
from app.user.DTO import UserData
from app.utils.security import authorize_roles
import app.code_autosave.service as serv

router = APIRouter(prefix="/api/code", tags=["code-saving"])


class GetCodeDTO(BaseModel):
    problem_id: int
    language: str


class SaveCodeDTO(BaseModel):
    problem_id: int
    language: str
    code: str


@authorize_roles("Regular User")
@router.post("/{problem_id}")
async def save_code(
        data: SaveCodeDTO,
        userdata: UserData = Depends(get_userdata)):
    return await serv.save_code(data.problem_id, data.language, data.code, userdata)


@authorize_roles("Regular User")
@router.get("/{problem_id}")
async def get_code(
        data: GetCodeDTO,
        userdata: UserData = Depends(get_userdata),
        db: AsyncSession = Depends(get_session)):
    return serv.get_code(data.problem_id, data.language, userdata, db)
