# 베이스 이미지 (Node.js 16 LTS 버전)
FROM node:16-alpine

# git 설치 (npm install에 필요)
RUN apk add --no-cache git

# 작업 디렉토리 생성
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 앱 소스 복사
COPY . .

# DLL 빌드 실행
RUN npm run build:dll

# 환경변수 설정
ENV TARGET=http://oj-backend:8000
ENV PORT=3000
ENV NODE_ENV=development
ENV HOST=0.0.0.0

# 포트 노출
EXPOSE 3000

# 개발 서버 실행 명령 (호스트 바인딩 추가)
CMD ["npm", "run", "dev"]