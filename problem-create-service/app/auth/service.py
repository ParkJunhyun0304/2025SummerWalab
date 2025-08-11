from app.config.security import exchange_sso_for_local_token, get_redis
from dotenv import load_dotenv
import os

load_dotenv()

LOCAL_TOKEN_TTL_SECONDS = int(os.getenv("LOCAL_TOKEN_TTL_SECONDS"))
REDIS_URL = os.getenv("REDIS_URL")
REDIS_SESSION_PREFIX = os.getenv("REDIS_SESSION_PREFIX")


async def login(token, response):
    token = await exchange_sso_for_local_token(token)
    response.set_cookie(
        "pcs_token",
        token,
        httponly=True,
        max_age=1800,
        samesite="Strict",
    )


async def logout(token, response):
    redis = await get_redis()
    redis_key = f"{REDIS_SESSION_PREFIX}{token}"
    await redis.delete(redis_key)

    response.set_cookie(
        "pcs_token",
        "",
        httponly=True,
        max_age=0,
        samesite="Strict",
    )
