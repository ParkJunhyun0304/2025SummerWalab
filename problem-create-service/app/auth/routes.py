from fastapi import HTTPException

from fastapi import APIRouter, Response, Cookie
from pydantic import BaseModel
from app.auth.service import login, logout as auth_logout

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    token: str


@router.post("/login")
async def login_with_sso(req: LoginRequest, res: Response):
    token = req.token
    if not token:
        raise HTTPException(status_code=400, detail="bad request")
    await login(req.token, res)
    return {"success": True}


@router.post("/logout")
async def logout_route(res: Response, token: str | None = Cookie(None, alias="pcs_token")):
    if not token:
        raise HTTPException(status_code=400, detail="bad request")
    await auth_logout(token, res)
    return {"success": True}
