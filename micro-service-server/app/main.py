from fastapi import FastAPI
from app.config.settings import settings
from app.security.cors import setup_cors
import logging
from datetime import datetime

from sqlalchemy import text
from sqlalchemy.orm import configure_mappers
from app.config.database import get_session, engine, Base

from app.auth import routes as auth_routes
from app.problem import routes as problem_routes
from app.workbook import routes as workbook_routes
from app.execution import routes as execution_routes

app = FastAPI(**settings.fastapi_kwargs)
setup_cors(app)
logging.basicConfig(level=logging.INFO)

app.include_router(auth_routes.router)
app.include_router(problem_routes.router)
app.include_router(workbook_routes.router)
app.include_router(execution_routes.router)


@app.on_event("startup")
async def startup_event():
    try:
        configure_mappers()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logging.info("DB init success")
    except Exception:
        logging.exception("DB init fail")

def root():
    return {"status": "ok", "message": "Service is running"}


def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
