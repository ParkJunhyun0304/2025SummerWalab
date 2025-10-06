from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_session
from app.security.deps import get_userdata
from app.user.DTO import UserData
from app.utils.security import authorize_roles
import app.code_autosave.service as serv

router = APIRouter(prefix="/api/code", tags=["code-saving"])


@authorize_roles("Regular User")
@router.post("/{problem_id}")
def save_code(
        problem_id: int,
        language: str,
        userdata: UserData = Depends(get_userdata),
        db: AsyncSession = Depends(get_session)):
    return serv.save_code(problem_id, language, userdata, db)


@authorize_roles("Regular User")
@router.post("/{problem_id}")
def get_code(
        problem_id: int,
        language: str,
        userdata: UserData = Depends(get_userdata),
        db: AsyncSession = Depends(get_session)):
    return serv.get_code(problem_id, language, userdata, db)
