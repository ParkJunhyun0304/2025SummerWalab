from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.auth.jwt import verify_password, create_access_token
from typing import Optional


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        """사용자명으로 사용자 조회"""
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """ID로 사용자 조회"""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    
    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """사용자 인증"""
        user = await self.get_user_by_username(username)
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        return user
    
    async def create_access_token(self, user: User) -> str:
        """사용자용 액세스 토큰 생성"""
        return create_access_token(data={"sub": user.username})
    
    async def login(self, user_login: UserLogin) -> Optional[str]:
        """사용자 로그인"""
        user = await self.authenticate_user(user_login.username, user_login.password)
        if not user:
            return None
        
        # 마지막 로그인 시간 업데이트
        from datetime import datetime
        user.last_login = datetime.utcnow()
        await self.db.commit()
        
        return await self.create_access_token(user)
