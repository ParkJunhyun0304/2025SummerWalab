from fastapi import HTTPException, Request, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_session
from app.user.DTO import UserData
from app.user.service import check_user_exists_by_username
from app.security.security import get_user_session_data
import os

TOKEN_NAME = os.getenv("TOKEN_COOKIE_NAME")

async def get_userdata(request: Request, db: AsyncSession = Depends(get_session)) -> UserData:
    token = request.cookies.get(TOKEN_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    userdata = await get_user_session_data(token)
    if not userdata:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    if not await check_user_exists_by_username(userdata.username, db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return userdata
