# my-home-frontend

놀러와 마이홈 제작 계산기 프론트엔드입니다. (Vite + React + TypeScript)

## 요구 사항

- Node.js 24 (`.nvmrc`)
- pnpm 12 (`package.json`의 `packageManager`로 고정)

pnpm은 어떤 방법으로 설치해도 됩니다. `pnpm install`을 실행하면 `packageManager`에 고정된 버전으로 자동 전환됩니다.

```bash
npm install -g pnpm
pnpm install
```

## 스크립트

| 명령                | 설명                                   |
| ------------------- | -------------------------------------- |
| `pnpm start`        | 개발 서버 실행 (http://localhost:3000) |
| `pnpm build`        | 프로덕션 빌드 (`build/`)               |
| `pnpm preview`      | 빌드 결과를 로컬에서 확인              |
| `pnpm test`         | 테스트 watch 모드 (Vitest)             |
| `pnpm test:ci`      | 테스트 1회 실행                        |
| `pnpm typecheck`    | 타입 체크 (`tsc --noEmit`)             |
| `pnpm lint`         | ESLint (경고도 실패로 처리)            |
| `pnpm format`       | Prettier로 전체 포맷 적용              |
| `pnpm format:check` | 포맷 검사                              |

PR과 `main` 푸시마다 GitHub Actions(`.github/workflows/ci.yml`)가
typecheck → lint → format:check → test:ci → build 순서로 검증합니다.

## 환경 변수

API 서버 주소는 환경별 `.env` 파일로 정합니다. 두 파일은 커밋되어 있습니다.

| 파일               | 사용 시점                | `VITE_API_BASE_URL`     |
| ------------------ | ------------------------ | ----------------------- |
| `.env.development` | `pnpm start` (개발 서버) | `http://localhost:8123` |
| `.env.production`  | `pnpm build` (운영 빌드) | 운영 API 서버           |

개발 중에 다른 서버를 쓰려면 `.env.development.local`(git 미추적)에 덮어씁니다.

```bash
echo "VITE_API_BASE_URL=http://43.200.90.33:8123" > .env.development.local
```

## 폴더 구조

`src/` 아래는 레이어로 나뉘고, import는 `@/` 별칭(`@/apis/client` 등)으로 씁니다.
화면 → 서버 상태 → API 순으로만 의존하며, 이 규칙은 ESLint(`eslint.config.js`)가 검사합니다.

| 폴더          | 역할                                               | 가져올 수 있는 것                      |
| ------------- | -------------------------------------------------- | -------------------------------------- |
| `app/`        | 앱 셸: 프로바이더, 라우터, 레이아웃, 에러 경계     | 전부                                   |
| `pages/`      | 라우트 화면(컴포넌트 조합)                         | `components`, `queries`, `state` 등    |
| `components/` | 도메인별 UI 컴포넌트                               | `queries`, `state`, `domain`, `lib` 등 |
| `queries/`    | react-query 훅과 쿼리 키                           | `apis`, `domain`, `lib`, `types`       |
| `apis/`       | HTTP 클라이언트와 엔드포인트별 함수                | `domain`, `lib`, `types`               |
| `state/`      | 클라이언트 전역 상태(장바구니, 관리자 확인)        | `domain`, `lib`, `types`               |
| `domain/`     | 계산·변환 같은 순수 로직(React·HTTP 없음)          | `lib`, `types`                         |
| `lib/`        | 범용 유틸(저장소, 숫자 표시, 엑셀, 이미지 주소 등) | `types`                                |
| `types/`      | 서버 응답·요청 타입                                | 없음                                   |
| `test/`       | 테스트 도우미                                      | —                                      |

- 화면(`pages`, `components`)은 `apis/`를 직접 쓰지 않고 `queries/`의 훅을 씁니다. 예외는 오류 메시지용 `apis/errors`입니다.
- `localStorage`는 `lib/storage`로만 다루고, `xlsx`는 첫 화면 번들에서 빠지도록 `lib/excel`에서 동적으로 불러옵니다.
