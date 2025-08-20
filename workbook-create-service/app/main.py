from fastapi import FastAPI
from app.config.settings import settings
from app.config.cors import setup_cors

# Import all models here to ensure they are registered with SQLAlchemy's declarative base
# User 모델을 먼저 import하여 Workbook 모델에서 참조할 수 있도록 함
from app.user import models as user_models
from app.workbook import models as workbook_models

from app.auth import routes as auth_routes
from app.workbook import routes as workbook_routes
from datetime import datetime

app = FastAPI(**settings.fastapi_kwargs)
setup_cors(app)

app.include_router(auth_routes.router)
app.include_router(workbook_routes.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Workbook Create Service is running"}


@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
