from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.sso import sso_service
from app.user.service import UserService
from app.user.dependencies import get_current_user
from app.user.models import User
from app.config.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()
security = HTTPBearer()


@router.post("/sso/verify")
async def verify_sso_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """
    SSO 토큰을 검증하고 사용자 정보를 반환합니다.
    
    Authorization 헤더에 'Bearer {token}' 형태로 토큰을 전달해야 합니다.
    """
    token = credentials.credentials
    
    # SSO 토큰 검증
    user_info = await sso_service.verify_token(token)
    if not user_info:
        raise HTTPException(status_code=401, detail="유효하지 않은 SSO 토큰입니다")
    
    # 로컬 DB에서 사용자 정보 확인/생성
    user_service = UserService(db)
    user = await user_service.get_user_by_username(user_info["username"])
    
    if not user:
        # 새 사용자 생성
        user = await user_service.create_user_from_sso(user_info)
    
    return {
        "message": "SSO 토큰 검증 성공",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "admin_type": user.admin_type,
            "is_admin": user.is_admin
        }
    }


@router.get("/sso/user")
async def get_sso_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    현재 인증된 SSO 사용자 정보를 반환합니다.
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "admin_type": current_user.admin_type,
        "is_admin": current_user.is_admin
    }
