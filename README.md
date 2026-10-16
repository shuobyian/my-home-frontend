# my-home-frontend

놀러와 마이홈 제작 계산기 프론트엔드입니다. (Create React App 기반)

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
| `pnpm test`         | 테스트 watch 모드                      |
| `pnpm test:ci`      | 테스트 1회 실행                        |
| `pnpm typecheck`    | 타입 체크 (`tsc --noEmit`)             |
| `pnpm lint`         | ESLint (경고도 실패로 처리)            |
| `pnpm format`       | Prettier로 전체 포맷 적용              |
| `pnpm format:check` | 포맷 검사                              |

PR과 `main` 푸시마다 GitHub Actions(`.github/workflows/ci.yml`)가
typecheck → lint → format:check → test:ci → build 순서로 검증합니다.

## 환경 변수

API 서버 주소는 환경별 `.env` 파일로 정합니다. 두 파일은 커밋되어 있습니다.

| 파일               | 사용 시점                | `REACT_APP_API_BASE_URL` |
| ------------------ | ------------------------ | ------------------------ |
| `.env.development` | `pnpm start` (개발 서버) | `http://localhost:8123`  |
| `.env.production`  | `pnpm build` (운영 빌드) | 운영 API 서버            |

개발 중에 다른 서버를 쓰려면 `.env.development.local`(git 미추적)에 덮어씁니다.

```bash
echo "REACT_APP_API_BASE_URL=http://43.200.90.33:8123" > .env.development.local
```
