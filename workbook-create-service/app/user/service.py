from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, exists
from app.user.models import User
from app.user.schemas import UserCreate
from app.auth.jwt import get_password_hash
from typing import Optional, Dict, Any


async def check_user_exists_by_username(username: str, db: AsyncSession) -> bool:
    # Using exists() is generally more efficient for just checking existence.
    stmt = select(exists().where(User.username == username))
    result = await db.execute(stmt)
    return result.scalar()


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        """사용자명으로 사용자를 조회합니다."""
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """ID로 사용자를 조회합니다."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """사용자 인증을 수행합니다."""
        user = await self.get_user_by_username(username)
        if not user:
            return None
        if not user.verify_password(password):
            return None
        return user
    
    async def create_user(self, user_data: UserCreate) -> User:
        """새 사용자를 생성합니다."""
        hashed_password = get_password_hash(user_data.password)
        user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password,
            admin_type="REGULAR_USER"
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def create_user_from_sso(self, sso_user_info: Dict[str, Any]) -> User:
        """SSO 정보로부터 새 사용자를 생성합니다."""
        user = User(
            username=sso_user_info["username"],
            email=None,  # SSO에서는 이메일을 제공하지 않을 수 있음
            password_hash="",  # SSO 사용자는 비밀번호가 없음
            admin_type=sso_user_info.get("admin_type", "REGULAR_USER")
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def create_access_token(self, user: User) -> str:
        """사용자에 대한 액세스 토큰을 생성합니다."""
        from app.auth.jwt import create_access_token
        return create_access_token(data={"sub": user.username})
    
    async def login(self, username: str, password: str) -> Optional[str]:
        """사용자 로그인을 수행하고 토큰을 반환합니다."""
        user = await self.authenticate_user(username, password)
        if not user:
            return None
        
        return await self.create_access_token(user)
