import os, re
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv

from app.config.database import get_session
from app.config.redis import get_redis_code_save
import app.code_autosave.service as autosave_serv
from app.utils.logging import logger
load_dotenv()
CODE_SAVE_PREFIX = os.getenv("REDIS_CODE_SAVE_PREFIX")
LOCAL_TOKEN_COOKIE_NAME = os.getenv("LOCAL_TOKEN_COOKIE_NAME")

KEY_PATTERN = re.compile(
    r"^(?P<prefix>\w+):debounce:user:(?P<uid>\d+):problem:(?P<pid>\d+):lang:(?P<lang>[a-zA-Z0-9_]+)$")


async def code_save_listener(db: AsyncSession = Depends(get_session)):
    redis = await get_redis_code_save()
    pubsub = redis.pubsub()
    await  pubsub.subscribe("__keyevent@10__:expired")
    async for msg in pubsub.listen():
        if msg["type"] == "message":
            await _code_save(redis, msg["data"], db)


async def _code_save(redis, debounce_key, db: AsyncSession):
    if not debounce_key.startswith(f"{CODE_SAVE_PREFIX}:debounce:"):
        return
    user_id, problem_id, language = await _parse_debounce_key(debounce_key)
    data_key = await autosave_serv.get_data_key(problem_id, language, user_id)
    code = await redis.get(data_key)
    try:
        await autosave_serv.save_code_to_database(problem_id, language, code, user_id, db)
    except Exception as e:
        logger.error(f"auto_save_persist failed: {e}")
        return
    await redis.delete(data_key)


async def _parse_debounce_key(key: str):
    match = KEY_PATTERN.match(key)
    if not match:
        return None
    return int(match["uid"]), int(match["pid"]), match["lang"]
