import json
import os
import uuid

import httpx
import redis.asyncio as aioredis
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

SSO_INTROSPECT_URL = os.getenv("SSO_INTROSPECT_URL",)
REDIS_URL = os.getenv("REDIS_URL")
REDIS_SESSION_PREFIX = os.getenv("REDIS_SESSION_PREFIX")
LOCAL_TOKEN_COOKIE_NAME = os.getenv("LOCAL_TOKEN_COOKIE_NAME")
LOCAL_TOKEN_TTL_SECONDS = int(os.getenv("LOCAL_TOKEN_TTL_SECONDS"))

async def get_redis():
    return await aioredis.from_url(REDIS_URL, decode_responses=True)

async def exchange_sso_for_local_token(sso_token: str) -> str:
    if not SSO_INTROSPECT_URL:
        raise HTTPException(status_code=500, detail="SSO_INTROSPECT_URL is not configured")

    async with httpx.AsyncClient(timeout=3.0) as client:
        resp = await client.post(SSO_INTROSPECT_URL, json={"token": sso_token})

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="SSO unreachable")

    user_data = resp.json().get("data")
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid SSO token")

    if user_data["admin_type"] == "Regular User":
        raise HTTPException(status_code=403, detail="Permission Denied")

    local_token = str(uuid.uuid4())
    redis = await get_redis()
    redis_key = f"{REDIS_SESSION_PREFIX}{local_token}"
    await redis.setex(redis_key, LOCAL_TOKEN_TTL_SECONDS, json.dumps(user_data, separators=(",", ":")))
    return local_token

async def verify_local_token(token: str,) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    redis = await get_redis()
    redis_key = f"{REDIS_SESSION_PREFIX}{token}"
    user_data_str = await redis.get(redis_key)

    if not user_data_str:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    try:
        user_data = json.loads(user_data_str)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Corrupted session data")

    return user_data