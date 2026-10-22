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
echo "VITE_API_BASE_URL=https://my-home-backend-jqsu.onrender.com" > .env.development.local
```

## 배포 (Vercel)

Vercel 무료(Hobby) 플랜에 올립니다. 설정은 `vercel.json`에 있습니다.

- 빌드: `pnpm install --frozen-lockfile` → `pnpm build`, 출력 폴더 `build/`
- `BrowserRouter`를 쓰므로 정적 파일이 아닌 모든 경로를 `index.html`로 보냅니다(새로고침해도 404가 나지 않음).
- 해시가 붙은 `assets/` 파일은 1년 동안 캐시합니다.

처음 한 번만 설정합니다.

1. [Vercel](https://vercel.com)에서 **Add New > Project**로 이 저장소를 가져옵니다. Framework Preset은 Vite로 잡히고, 나머지 빌드 설정은 `vercel.json`을 따릅니다.
2. **Settings > Environment Variables**(Production)에 다음을 넣습니다.

   | 이름                           | 값                                                            |
   | ------------------------------ | ------------------------------------------------------------- |
   | `VITE_API_BASE_URL`            | Render 백엔드 주소 (예: `https://<서비스 이름>.onrender.com`) |
   | `ENABLE_EXPERIMENTAL_COREPACK` | `1` (`packageManager`의 pnpm 12를 쓰도록 함)                  |

   빌드 때 설정한 환경변수가 `.env.production`보다 우선합니다. 페이지는 HTTPS로 서비스되므로 API 주소도 `https://`여야 브라우저가 막지 않습니다.

3. Node.js 버전은 `package.json`의 `engines.node`(>=24)를 따릅니다.

이후 `main`에 푸시하면 운영에 배포되고, PR마다 미리보기 주소가 만들어집니다.
환경변수를 바꾼 뒤에는 다시 배포해야 반영됩니다(Vite는 빌드할 때 값을 넣음).

## 폴더 구조

`src/` 아래는 레이어로 나뉘고, import는 `@/` 별칭(`@/apis/client` 등)으로 씁니다.
화면 → 서버 상태 → API 순으로만 의존하며, 이 규칙은 ESLint(`eslint.config.js`)가 검사합니다.

| 폴더          | 역할                                               | 가져올 수 있는 것                   |
| ------------- | -------------------------------------------------- | ----------------------------------- |
| `app/`        | 앱 셸: 프로바이더, 라우터, 레이아웃, 에러 경계     | 전부                                |
| `pages/`      | 라우트 화면: URL 해석, 데이터 조회·변경, 조합      | `components`, `queries`, `state` 등 |
| `components/` | 도메인별 UI 컴포넌트(props 기반 표현)              | `state`, `domain`, `lib`, `types`   |
| `queries/`    | react-query 훅과 쿼리 키                           | `apis`, `domain`, `lib`, `types`    |
| `apis/`       | HTTP 클라이언트와 엔드포인트별 함수                | `domain`, `lib`, `types`            |
| `state/`      | 클라이언트 전역 상태(장바구니, 관리자 확인)        | `domain`, `lib`, `types`            |
| `domain/`     | 계산·변환 같은 순수 로직(React·HTTP 없음)          | `lib`, `types`                      |
| `lib/`        | 범용 유틸(저장소, 숫자 표시, 엑셀, 이미지 주소 등) | `types`                             |
| `types/`      | 서버 응답·요청 타입                                | 없음                                |
| `test/`       | 테스트 도우미                                      | —                                   |

- 서버 데이터 조회·변경(`queries/`)은 `pages`와 `app`에서만 하고, `components`에는 props로 넘깁니다.
- 화면(`pages`, `components`)은 `apis/`를 직접 쓰지 않습니다. 예외는 오류 메시지용 `apis/errors`입니다.
- `components`의 도메인 폴더(`cart`, `product` 등)끼리는 서로 가져오지 않습니다. 함께 쓰는 것은 `common`과 결과 표시(`result`)뿐이고, 그 밖의 조합은 `pages`에서 합니다.
- 화면은 `app/`에서 경로 상수인 `app/routes`만 가져옵니다.
- `localStorage`는 `lib/storage`로만 다루고, `xlsx`는 첫 화면 번들에서 빠지도록 `lib/excel`에서 동적으로 불러옵니다.
