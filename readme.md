# 2025 Summer Walab OJ project

[FrontEnd](/OnlineJudgeFE/)

[BackEnd](/OnlineJudge/)

[Spring MircoService](/test-project-oj/)


### version information

Django - python3.12

Vue.js - node 16

Spring boot - java 17

### how to build and run

#### 1. 환경변수 설정

Google OAuth를 사용하기 위해 환경변수를 설정해야 합니다. 프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Google OAuth Configuration
VUE_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
VUE_APP_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VUE_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
```

#### 2. Docker Compose 실행

``` bash
docker compose up -d --build
```

### Git 규칙

#### 커밋 메시지

- **형식:** `type: description (#issue)`
- **타입:** feat, fix, docs, style, refactor, test, chore, build
- **설명**
  - feat → 새로운 기능 추가
  - fix → 버그 수정
  - docs → 문서 작업
  - style → 코드 스타일 변경
  - refactor → 리팩터링
  - test → 테스트 코드
  - chore → 빌드/설정/패키지 관리 등
  - build → 빌드 시스템 및 의존성 관련
- **예시:**  
  feat: 로그인 API 추가 (#12)  
  fix: 메인페이지 CSS 수정 (#15)

---

#### 브랜치

- **main:** 배포용
- **dev:** 통합 개발용
- **working:** 기능/수정 단위 작업용
- **네이밍 규칙:** `type/issue`
- **타입:** feat, hotfix, docs, style, refactor, test, chore, build
- **설명**
  - feat → 기능 개발
  - hotfix → 긴급 수정
  - docs → 문서 작업
  - style → 코드 스타일 변경
  - refactor → 리팩터링
  - test → 테스트 코드
  - chore → 빌드/설정/패키지 관리 등
  - build → 빌드 시스템 및 의존성 관련
- **예시:**  
  feat/#1  
  hotfix/#3