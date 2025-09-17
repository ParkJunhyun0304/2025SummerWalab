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

### 커밋 메시지 템플릿

`.gitmessage`는 커밋 제목을 일정한 형식으로 유지하도록 돕는 템플릿입니다. 아래 명령어를 한 번만 실행하면 `git commit` 시 자동으로 템플릿이 적용됩니다.
```bash
git config commit.template .gitmessage
```

#### 예시 (Examples)

커밋 메시지는 일반적으로 다음과 같은 타입을 사용합니다.
```
[type]: description (#issue number)
```
- **feat**: 새로운 기능 추가 
- **fix**: 버그 수정 
- **docs**: 문서 변경
- **style**: 코드 스타일 변경meaning of the code)
- **refactor**: 코드 리팩토링 
- **test**: 테스트 코드 추가 또는 수정 
- **chore**: 빌드 프로세스 및 기타 변경


