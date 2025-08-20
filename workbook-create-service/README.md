# Workbook Create Service

문제집 생성 마이크로 서비스입니다. FastAPI를 사용하여 구현되었으며, OnlineJudge의 데이터베이스를 활용합니다.

## 주요 기능

- 사용자 인증 (JWT 토큰 기반)
- 문제집 생성, 수정, 삭제
- 문제집에 문제 추가/제거
- 공개/비공개 문제집 관리
- 사용자별 문제집 목록 조회

## 기술 스택

- **Backend**: FastAPI, Python 3.11
- **Database**: PostgreSQL (OnlineJudge DB와 연동)
- **Authentication**: SSO (Single Sign-On) + Redis 세션
- **ORM**: SQLAlchemy (Async)
- **Container**: Docker
- **Session Store**: Redis

## 프로젝트 구조

```
workbook-create-service/
├── app/
│   ├── config/        # 설정 및 데이터베이스 연결
│   │   ├── database.py    # 데이터베이스 연결 설정
│   │   ├── settings.py    # 애플리케이션 설정
│   │   └── security.py    # SSO 인증 및 보안
│   ├── auth/          # SSO 인증 관련
│   │   ├── service.py     # 인증 서비스 로직
│   │   ├── routes.py      # 인증 API 엔드포인트
│   │   └── dependencies.py # 인증 의존성 함수
│   ├── user/          # 사용자 관련 (모델, 스키마, 서비스, API)
│   │   ├── models.py      # User 모델
│   │   ├── schemas.py     # User Pydantic 스키마
│   │   ├── service.py     # User 비즈니스 로직
│   │   ├── api.py         # User API 엔드포인트
│   │   └── dependencies.py # User 인증 의존성
│   └── workbook/      # 문제집 관련 (모델, 스키마, 서비스, API)
│       ├── models.py      # Workbook, Problem 모델
│       ├── schemas.py     # Workbook Pydantic 스키마
│       ├── service.py     # Workbook 비즈니스 로직
│       └── api.py         # Workbook API 엔드포인트
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

## 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://onlinejudge:onlinejudge@localhost:5432/onlinejudge

# Redis Configuration
REDIS_URL=redis://localhost:6379

# SSO Configuration
SSO_INTROSPECT_URL=http://localhost:8000/api/sso/introspect

# Session Configuration
REDIS_SESSION_PREFIX=wcs_session:
LOCAL_TOKEN_COOKIE_NAME=wcs_token
LOCAL_TOKEN_TTL_SECONDS=1800

# CORS Configuration
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:8080"]
```

### 3. Docker로 실행

```bash
# OnlineJudge 네트워크에 연결
docker network connect oj_default workbook-create-service

# 서비스 실행
docker-compose up -d
```

### 4. 로컬에서 실행

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API 엔드포인트

### 인증 (SSO 기반)

- `POST /api/auth/login` - SSO 토큰으로 로그인
- `POST /api/auth/logout` - 로그아웃

**SSO 인증 플로우:**
1. OnlineJudge에서 `/api/sso`로 토큰 발행
2. 클라이언트가 workbook-create-service의 `/api/auth/login`에 토큰 전송
3. 서비스가 OnlineJudge의 SSO 엔드포인트로 토큰 검증
4. 검증 성공 시 로컬 세션 토큰 발행 (쿠키에 저장)
5. 이후 요청에서는 쿠키의 로컬 토큰으로 인증

### 문제집 관리

- `POST /api/workbooks/` - 문제집 생성
- `GET /api/workbooks/` - 사용자 문제집 목록
- `GET /api/workbooks/public` - 공개 문제집 목록
- `GET /api/workbooks/{id}` - 문제집 상세 조회
- `PUT /api/workbooks/{id}` - 문제집 수정
- `DELETE /api/workbooks/{id}` - 문제집 삭제

### 문제 관리

- `POST /api/workbooks/{id}/problems` - 문제집에 문제 추가
- `DELETE /api/workbooks/{id}/problems/{problem_id}` - 문제집에서 문제 제거

## 데이터베이스 스키마

이 서비스는 OnlineJudge의 기존 데이터베이스를 활용하며, 다음 테이블들을 추가로 생성합니다:

- `workbook` - 문제집 정보
- `workbook_problem` - 문제집과 문제의 관계

## 개발 가이드

### 새로운 객체 추가

1. `app/{object_name}/` 폴더 생성
2. `models.py`에 모델 정의
3. `schemas.py`에 Pydantic 스키마 정의
4. `service.py`에 비즈니스 로직 구현
5. `api.py`에 API 엔드포인트 추가
6. `main.py`에 라우터 등록

### 인증이 필요한 API 엔드포인트 구현

```python
from app.user.dependencies import get_current_user
from app.user.models import User

@router.post("/protected-endpoint")
async def protected_endpoint(
    current_user: User = Depends(get_current_user)
):
    """인증이 필요한 엔드포인트"""
    return {"message": f"Hello {current_user.username}!"}
```

**인증 플로우:**
1. 클라이언트가 SSO 토큰으로 `/api/auth/login` 호출
2. 로그인 성공 시 쿠키에 로컬 세션 토큰 저장
3. 이후 요청에서 `get_current_user` 의존성으로 사용자 정보 자동 검증
4. 인증 실패 시 401 Unauthorized 응답

### 테스트

```bash
# 테스트 실행
pytest

# 커버리지 확인
pytest --cov=app
```

## 라이센스

MIT License
