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

## 로그인과 권한

- `/login`·`/signup`에서 로그인·회원가입합니다. 서버가 준 토큰은 `localStorage`의 `my-home-auth`에 두고, API 요청마다 `Authorization: Bearer <토큰>`으로 보냅니다.
- 토큰이 만료되었거나 서버가 401을 돌려주면 이 기기의 로그인을 지웁니다.
- 관리 화면(`/manage`)과 물품·시세·결과를 바꾸는 API는 관리자 계정만 씁니다. 관리자 계정은 백엔드에서 `python manage.py createsuperuser`로 만듭니다(my-home-backend README 참고).
- 메뉴는 `src/app/menus.tsx`에서 `USER_MENU`(누구나), `MEMBER_MENU`(로그인한 회원), `ADMIN_MENU`(관리자)로 나뉩니다. `AppNav`는 로그인했을 때 회원 메뉴를 누구나 쓰는 메뉴에 이어 붙이고, 관리자로 로그인했을 때만 관리자 메뉴를 구분선 아래에 보여 줍니다. 메뉴를 감추는 것은 편의일 뿐이고, 화면은 `RequireAdmin`이, 데이터는 서버가 막습니다.
- **보유 재료**(`/inventory`, 로그인 필요): 가진 기초 재료(시세가 있는 최하위 재료) 개수를 서버에 저장합니다(`GET`·`PUT /inventory`). 재료는 서버 시세의 분류(`group`: 작물·광물·별빛 재료 등, 값은 `src/types/enums.ts`의 `MarketGroupType`)별로 묶어 보이고, 기타는 마지막입니다(시세 조작 모드 시세 입력과 관리 화면 시세 목록도 같은 묶음으로 보입니다). 분류는 관리 화면 시세 목록에서 카드마다 고르고, 고른 카드는 저장한 뒤 새 묶음으로 옮겨 갑니다. 분류를 더하거나 이름을 바꾸려면 서버(`MarketGroup`)와 이 목록을 함께 고칩니다. 저장된 값과 달라진 재료만 보내고, 비운 칸은 0개입니다. 로그인한 동안 결과(홈), 장바구니 합산, 시세 조작 모드 결과의 기초 재료 표에 **보유**와 **부족**(개수 − 보유, 넉넉하면 0) 열이 함께 보이고, 결과 카드에는 부족 재료비(넉넉하면 "재료 충분")가 보입니다. 보유 재료를 받지 못하면 표와 카드는 원래대로 보입니다.
- **프로필**(`/profile`, 로그인 필요): 메뉴의 닉네임을 누르면 열립니다. 아이디를 보여 주고 닉네임을 바꿉니다(`PATCH /auth/me`). 저장하면 이 기기에 저장된 로그인 정보의 닉네임도 바뀌어 메뉴에 바로 보입니다. 아이디는 바꿀 수 없습니다.
- **제보 게시판**(`/report`): 버그나 잘못된 수치·정보를 알리는 게시판입니다. 로그인한 회원만 보고 씁니다(`/report/new`). 회원은 자기가 쓴 제보만, 관리자는 모든 제보를 목록과 글로 봅니다. 로그인하지 않았으면 로그인 화면으로 보냅니다. 글마다 **바꿀 값**을 20줄까지 넣습니다. 한 줄은 종류(레벨 경험치·시세·물품·물품 재료) → 대상(예: 90레벨) → 항목(예: 필요 경험치) → 바른 값(예: 10000000) 순서로 고르고, 고른 대상의 현재 값이 함께 보입니다. 고를 수 있는 항목은 `src/domain/report.ts`의 `CHANGE_FIELDS`이고 서버 목록(my-home-backend `apps/reports/changes.py`)과 같아야 합니다. 쓴 사람은 접수 상태일 때만 고치거나 지웁니다. 관리자는 글 아래에서 반영·반려와 답변을 저장하고, 언제든 지울 수 있습니다. 반영으로 바꿔도 데이터는 바뀌지 않으므로 관리 화면에서 직접 고칩니다.
- 메뉴는 떠 있는 둥근 막대로, 768px 미만은 화면 아래, 그 이상은 화면 위 가운데에 있습니다. 1024px 이상은 아이콘과 이름, 그보다 좁으면 아이콘만 보입니다(로그아웃은 늘 아이콘만). 관리자 메뉴는 따로 떠 있고 스크롤해도 따라옵니다. 768px 미만은 아래 막대 오른쪽의 버튼(렌치)을 누르면 이름과 함께 위로 열리고, 메뉴를 고르거나 바깥을 누르거나 Esc를 누르면 닫힙니다. 768px 이상은 화면 오른쪽 가운데의 세로 막대(아이콘만)로 늘 보이고, 본문이 가리지 않도록 오른쪽 여백을 더 둡니다.

## 관리 화면 흐름 (시세·물품·결과)

시세·물품·결과는 서버가 함께 맞춥니다. 결과 리스트를 따로 만드는 단계는 없습니다.

- **물품 리스트**: 물품을 추가·수정·삭제하면 서버가 같은 요청 안에서 결과도 만들거나 다시 계산합니다. 표의 '상태' 열이 물품마다 결과가 반영되었는지 보여 줍니다.
- **새 재료**: 물품 모달은 재료 이름을 시세·물품 이름과 바로 맞춰 봅니다. 시세에 없는 새 재료는 모달에서 시세를 함께 입력합니다. 저장하면 시세를 먼저 추가(`PUT /market`)한 뒤 물품을 저장합니다. 서버는 시세 없는 재료를 쓰는 물품을 거절합니다.
- **시세 리스트**: 재료를 추가하고 이름을 바꿀 수 있습니다. 이름을 바꾸면 그 재료를 쓰는 레시피도 함께 바뀝니다. 쓰는 물품이 없는 시세만 삭제할 수 있습니다.
- **데이터 점검**(`/manage/check`): 서버 점검(`GET /catalog/check`)의 문제를 보여 줍니다. 시세 없는 재료, 없는 하위 물품, 순환, 결과 없음·낡음 같은 것들입니다. 그 자리에서 시세 추가, 물품 수정, 결과 다시 맞추기를 할 수 있습니다. 물품·시세 리스트 위쪽 배너가 결과에 반영되지 않은 물품 수를 알려 줍니다.
- **활동 로그**(`/manage/log`): 회원가입, 로그인(실패 포함)·로그아웃, 닉네임·비밀번호 변경, 탈퇴, 제보 작성·수정·삭제·처리 이력을 최근 것부터 보여 줍니다(`GET /log`). 활동 종류와 아이디(일부 일치)로 거르고, 시각·IP·기기(User-Agent)가 함께 보입니다. 로그는 회원이나 제보를 지워도 남습니다.
- **Raw 엑셀 데이터**: 이 브라우저의 작업 초안(`my-home-product`)이고, 편집할 때마다 저장됩니다.
  - '저장'은 서버 목록과 비교해 서버에 없고 올린 적도 없는 이름만 올립니다.
  - 올린 적 있는 이름은 `my-home-product-known-names`에 기억합니다. 그래서 서버에서 지운 물품을 다시 올리지 않습니다.
  - 기존 물품의 수정·삭제는 '물품 리스트'에서 합니다.

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
| `state/`      | 클라이언트 전역 상태(장바구니, 로그인한 회원)      | `domain`, `lib`, `types`            |
| `domain/`     | 계산·변환 같은 순수 로직(React·HTTP 없음)          | `lib`, `types`                      |
| `lib/`        | 범용 유틸(저장소, 숫자 표시, 엑셀, 이미지 주소 등) | `types`                             |
| `ui/`         | 디자인 시스템: 토큰, 공용 UI 컴포넌트              | 없음(React만)                       |
| `types/`      | 서버 응답·요청 타입                                | 없음                                |
| `test/`       | 테스트 도우미                                      | —                                   |

- 서버 데이터 조회·변경(`queries/`)은 `pages`와 `app`에서만 하고, `components`에는 props로 넘깁니다.
- 화면(`pages`, `components`)은 `apis/`를 직접 쓰지 않습니다. 예외는 오류 메시지용 `apis/errors`입니다.
- `components`의 도메인 폴더(`cart`, `product` 등)끼리는 서로 가져오지 않습니다. 함께 쓰는 것은 `common`과 결과 표시(`result`)뿐이고, 그 밖의 조합은 `pages`에서 합니다.
- 화면은 `app/`에서 경로 상수인 `app/routes`만 가져옵니다.
- `localStorage`는 `lib/storage`로만 다루고, `xlsx`는 첫 화면 번들에서 빠지도록 `lib/excel`에서 동적으로 불러옵니다.
- `app`·`pages`·`components`만 `@/ui`를 가져옵니다. 그 밖의 레이어는 UI에 의존하지 않습니다.

## 디자인 시스템 (`src/ui/`)

UI 라이브러리 없이 앱에 필요한 컴포넌트만 직접 만들어 씁니다. 현재 토큰과 사용법은 [`claudedocs/design-system.md`](claudedocs/design-system.md), 초기 설계 근거는 [`claudedocs/design-system-plan.md`](claudedocs/design-system-plan.md)에 있습니다.

- 화면 코드는 `import { Button, Table, useToast } from "@/ui"`처럼 배럴에서만 가져옵니다.
- 색·간격·모서리·글자·컨트롤·그림자·모션은 `src/ui/tokens.ts`에서 정의하고 `global.styles.ts`가 CSS 변수로 적용합니다. 화면은 `var(--ui-color-primary)` 같은 의미·컴포넌트 토큰을 쓰며, `Stack`의 `gap`도 CSS 변수를 받습니다.
- 스타일은 emotion의 css prop으로 씁니다. `<Name>.styles.ts`에 `` css`...` ``로 두고 `css={[styles.a, cond && styles.b]}`처럼 조합합니다. 배열은 클래스 하나로 합쳐져 뒤 항목이 이기지만, 최상위 선언은 앞 항목의 `&:hover`·`@media` 같은 중첩 규칙을 이기지 못합니다. 템플릿 안의 `/* */` 주석은 번들에 그대로 남으므로, 주석은 템플릿 밖에 `//`로 답니다.
- 앱 최상단의 `UIProvider`가 토스트(`useToast`)와 확인 대화상자(`useDialogs`)를 제공합니다. 이 훅을 쓰는 컴포넌트를 테스트할 때는 `<UIProvider>`로 감쌉니다.
- 폼은 `useForm`(값·검증) + `Field`(라벨·도움말·오류 연결) + 입력 컴포넌트로 만듭니다.
- 지원 브라우저(Chrome 87·Safari 14 등)에 없는 `<dialog>`, `inert`, `:is()`/`:where()`/`:has()`는 쓰지 않습니다.
