# 제철엔

현재 달과 사용자의 위치를 기준으로 제철 음식·꽃 정보를 확인하고, 관련 장소를 추천하는 모바일 우선 웹 서비스입니다.

## 구성

- Frontend: React, TypeScript, Vite, React Router DOM, Kakao Maps JavaScript SDK
- Backend: Node.js, Express, CommonJS, Kakao Local REST API, Gemini API
- 브라우저 저장소: localStorage 기반 저장·최근 본 항목·최근 검색어

## 주요 경로

- `/` 홈과 이번 달 제철 추천
- `/search` 검색어 입력 및 최근 검색어
- `/seasonal/:keyword` 제철 정보와 주변 장소
- `/recommend` 카테고리별 이번 달 제철 추천
- `/map` 제철 장소 지도
- `/saved`, `/recent` 저장·최근 본 항목
- `/login`, `/signup` 입력 검증 UI

## 실행 방법

1. 백엔드 의존성을 설치하고 실행합니다.

   ```powershell
   Set-Location backend
   npm install
   npm run dev
   ```

2. 프런트 환경변수를 준비한 뒤 실행합니다. 실제 키는 저장소에 올리지 않습니다.

   ```text
   # frontend/.env
   VITE_KAKAO_MAP_KEY=
   VITE_API_BASE_URL=http://localhost:3000
   ```

   ```powershell
   Set-Location frontend
   npm install
   npm run dev
   ```

3. 백엔드 환경변수는 `backend/.env.example`을 참고합니다.

## 검증

```powershell
Set-Location frontend
npm run build
npm run lint
```

Gemini API 오류가 발생하면 제철 설명만 기본 정보로 대체하며, Kakao 장소 검색 결과는 계속 반환합니다.
