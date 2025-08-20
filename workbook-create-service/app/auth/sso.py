import httpx
from typing import Optional, Dict, Any
from app.config.settings import settings


class SSOService:
    """OnlineJudge SSO 토큰 검증 서비스"""
    
    def __init__(self):
        self.sso_verify_url = f"{settings.oj_base_url}/api/sso"
    
    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        SSO 토큰을 검증하고 사용자 정보를 반환합니다.
        
        Args:
            token: OnlineJudge에서 발행한 SSO 토큰
            
        Returns:
            사용자 정보 또는 None (토큰이 유효하지 않은 경우)
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.sso_verify_url,
                    json={"token": token},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("error") is None:
                        return {
                            "username": data.get("username"),
                            "avatar": data.get("avatar"),
                            "admin_type": data.get("admin_type"),
                            "is_admin": data.get("admin_type") in ["ADMIN", "SUPER_ADMIN"]
                        }
                
                return None
                
        except Exception as e:
            print(f"SSO 토큰 검증 중 오류 발생: {e}")
            return None
    
    async def get_user_info(self, token: str) -> Optional[Dict[str, Any]]:
        """토큰으로 사용자 정보를 가져옵니다 (verify_token의 별칭)"""
        return await self.verify_token(token)


# 전역 인스턴스
sso_service = SSOService()
