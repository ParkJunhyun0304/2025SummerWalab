import logging
import logging.handlers
import os

# 로그 파일 경로 설정
LOG_FILE_PATH = "/log/app.log"
os.makedirs(os.path.dirname(LOG_FILE_PATH), exist_ok=True)  # logs 폴더 생성

# 핸들러 설정
stream_handler = logging.StreamHandler()
file_handler = logging.handlers.RotatingFileHandler(
    LOG_FILE_PATH, mode="a", maxBytes=10 * 1024 * 1024, backupCount=15
)

formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
stream_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

# 기본 로깅 설정 (Root Logger)
logging.basicConfig(
    level=logging.INFO,
    handlers=[stream_handler, file_handler]
)

# Uvicorn 로거에도 파일 핸들러 추가
for logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
    log = logging.getLogger(logger_name)
    log.addHandler(file_handler)
    # Uvicorn 로그가 중복 출력되지 않도록 설정 (필요시)
    # log.propagate = False

# 로거 가져오기
logger = logging.getLogger("fastapi_app")