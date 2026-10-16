# my-home-frontend

놀러와 마이홈 제작 계산기 프론트엔드입니다. (Create React App 기반)

## 요구 사항

- Node.js 24 (`.nvmrc`)
- pnpm 12 (`package.json`의 `packageManager`로 고정)

```bash
corepack enable   # packageManager에 지정된 pnpm 버전을 사용
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

로컬 `.env`(git 미추적)에 설정합니다.

| 변수                | 설명                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `REACT_APP_PROFILE` | `DEV`이면 API 요청을 `http://localhost:8123`으로 보냅니다. 그 외에는 운영 API 서버를 사용합니다. |

> `.env`는 `pnpm build`에도 적용됩니다. 운영 배포용 빌드를 만들 때는 `REACT_APP_PROFILE=DEV`가 설정되어 있지 않은지 확인하세요.
