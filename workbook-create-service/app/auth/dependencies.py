from fastapi import Depends, HTTPException, Cookie
from app.config.security import verify_local_token


async def get_current_user(token: str = Cookie(None, alias="wcs_token")):
    """
    현재 인증된 사용자 정보를 반환하는 의존성 함수
    """
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        user_data = await verify_local_token(token)
        return user_data
    except HTTPException:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user_optional(token: str = Cookie(None, alias="wcs_token")):
    """
    선택적으로 현재 인증된 사용자 정보를 반환하는 의존성 함수
    인증이 실패해도 None을 반환하여 에러를 발생시키지 않음
    """
    if not token:
        return None
    
    try:
        user_data = await verify_local_token(token)
        return user_data
    except HTTPException:
        return None
