# 자체 디자인 시스템(`src/ui/`) 계획

antd 6과 `@ant-design/icons`를 걷어 내고, 앱이 실제로 쓰는 만큼만 갖춘 디자인 시스템을 `src/ui/`에 만든다.

## 1. 현황

- antd를 가져오는 파일 44개(테스트 6개 포함). 쓰는 컴포넌트: Button, Typography, Space·Flex, Form·Input·InputNumber·Select·Radio, Segmented, Table, Modal·`modal.confirm/info/error`, `message`, Drawer, Badge, Collapse, Empty, Result, Alert, Spin, Divider, Tooltip, Avatar·Image, Layout·Grid, ConfigProvider·theme 토큰.
- 아이콘은 `PictureOutlined`, `DeleteOutlined` 두 개뿐이다.
- 빌드 결과에서 antd 묶음이 903.94kB(gzip 290.74kB)로 가장 크다.

## 2. 원칙

- **런타임 의존성은 `@emotion/react` 하나.** 스타일은 css prop(`` css`...` ``), 값은 `:root`의 CSS 변수(`--ui-` 접두사)로 둔다. 처음에는 CSS Modules로 만들었고 뒤에 emotion으로 옮겼다(7단계의 6).
- **네이티브 요소 우선.** `<button>`, `<select>`, `<input type="radio">`, `<details>`, `<hr>`, `title` 속성 툴팁을 쓴다.
- **브라우저 대상 유지**(chrome87·edge88·firefox78·safari14). 그래서 `<dialog>`(Safari 15.4+), `inert`(Chrome 102+), `:is()`/`:where()`(Chrome 88+)는 쓰지 않는다. `:focus-visible`은 기본 외곽선을 지우지 않고 덧붙이는 용도로만 쓴다(미지원 브라우저는 기본 외곽선이 보인다).
- **앱이 쓰는 기능만 만든다.** 다크 모드, 크기 변형, 이미지 미리보기, 툴팁 컴포넌트, 범용 Form 엔진은 만들지 않는다.
- **접근성은 줄이지 않는다.** 라벨 연결, `aria-invalid`·`aria-describedby`, 대화상자 포커스 가두기·복원, 키보드 조작, 글자 대비 4.5:1 이상.

## 3. 구조

```
src/ui/
  global.styles.ts  토큰(:root 변수) + 전역 기본 스타일, UIProvider가 <Global>로 넣는다
  index.ts          공개 API 배럴 — 앱 코드는 `@/ui`에서만 가져온다
  icons.tsx         직접 그린 SVG 아이콘(장식용, aria-hidden)
  <Name>.tsx + <Name>.styles.ts(css``)
```

레이어 규칙(ESLint `import-x/no-restricted-paths`):

- `ui`는 `src`의 다른 레이어를 가져오지 않는다(React와 자기 파일만).
- `domain`·`lib`·`types`·`state`·`queries`·`apis`는 `ui`를 가져오지 않는다.
- `app`·`pages`·`components`는 `@/ui`를 가져온다.

## 4. 토큰

| 분류                   | 값                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| 색 — 주색              | `--ui-color-primary` #5c3572, hover #75508a, active #462657, 연한 배경 #f4eff7                     |
| 색 — 글자              | text rgba(0,0,0,.88), secondary rgba(0,0,0,.65), disabled rgba(0,0,0,.25)                          |
| 색 — 상태(글자)        | success #237804, warning #ad6800, danger #cf1322, info #0958d9 — 흰 배경 대비 4.5:1 이상           |
| 색 — 상태(배경·테두리) | error-bg #fff2f0, error-border #ffccc7 등                                                          |
| 색 — 면·선             | bg-container #fff, bg-layout #f5f5f5, fill-alter #fafafa, border #d9d9d9, border-secondary #f0f0f0 |
| 간격                   | `--ui-space-1`~`6`: 4·8·12·16·24·32px                                                              |
| 모서리                 | `--ui-radius-sm` 4, `--ui-radius` 6, `--ui-radius-lg` 8, `--ui-radius-xl` 10                       |
| 글자                   | 14px / 1.5715, 제목 h1~h5 38·30·24·20·16px 굵기 600, 한글 폰트 폴백 포함                           |
| 높이                   | 컨트롤 32px                                                                                        |
| 그림자·층              | `--ui-shadow`, `--ui-shadow-lg`, `--ui-z-overlay` 1000, `--ui-z-toast` 1100                        |

## 5. 컴포넌트 API

공통: 모든 컴포넌트는 `className`·`style`을 루트에 넘긴다(해당되는 것만). 부모의 css prop은 className으로 바뀌어 들어와 컴포넌트 스타일 뒤에 합쳐진다. 버튼·입력은 HTML 속성을 그대로 받는다.

### 기본

- `Button` — `variant?: "primary" | "default"`, `danger?`, `icon?`, `loading?`, 나머지 `<button>` 속성(`type` 기본 `"button"`, `form` 등). `loading`이면 스피너, `aria-busy="true"`, 클릭·제출을 막는다(포커스는 유지).
- `Title` — `level?: 1~5`(h1~h5). `Text` — `strong?`, `tone?: "secondary" | "success" | "warning" | "danger" | "info"`(span). `Paragraph` — p, `tone?`.
- `Stack` — flex 묶음. `vertical?`, `gap?: number`(px, 기본 8), `align?`, `justify?`, `wrap?`. 가로는 `align-items: center`, 세로는 `stretch`가 기본이다(버튼만 세로로 쌓을 때는 `align="flex-start"`). flex `gap`은 Safari 14.1부터 지원한다. 대상 중 Safari 14.0만 간격이 빠지는데, antd 5도 이미 flex gap을 쓰고 있었으므로 기존 지원 범위와 같다.
- `Spin` — 단독: 가운데 스피너 + `role="status"` "불러오는 중". `children`과 함께: `spinning`(기본 true)일 때 내용을 흐리게 하고 위에 스피너를 덮으며 `aria-busy`.
- `Empty` — `description?`(기본 "데이터 없음"), `children`(동작 버튼 등).
- `Result` — `status: "404" | "warning" | "error"`, `title`, `description?`, `actions?`.
- `Alert` — 오류 안내 상자. `title`, `description?`, `role="alert"`.
- 아이콘 — `DeleteIcon`, `PictureIcon`, `CloseIcon`, `PlusIcon`, `MinusIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `EyeIcon`, `EyeOffIcon`, `SuccessIcon`, `ErrorIcon`, `WarningIcon`, `InfoIcon`, `EmptyIcon`.
- 전역 클래스 `ui-sr-only`(화면에서만 숨김), `<hr>` 기본 스타일(Divider 대체).

### 폼

- `useForm(initialValues, validate)` → `{ values, errors, set(key, value), setValues(updater), handleSubmit(onValid, onInvalid?) }`.
  - `validate(values)`는 `{ [경로]: 메시지 }`를 돌려준다. 경로는 `"name"`, `"materials.0.count"`처럼 쓴다.
  - 오류는 첫 제출 시도 뒤부터 값이 바뀔 때마다 다시 계산해 보여 준다(antd의 "제출 후 실시간 검증"과 같다).
  - 외부 값으로 다시 채워야 하면 렌더 중에 이전 값과 비교해 `setValues`를 부른다(React의 "prop이 바뀔 때 state 조정" 패턴, effect로 `setFieldsValue` 하던 것을 대체). `key`로 다시 마운트하면 제출한 뒤 포커스가 사라지므로 쓰지 않는다.
- `Field` — `label`, `help?`, `error?`, `required?`(빨간 `*`), `hideLabel?`(라벨 줄을 화면에서만 숨긴다. placeholder만 보이던 칸·표 칸 안 입력용). 안쪽 DS 컨트롤에 `id`·`aria-describedby`·`aria-invalid`·`aria-required`를 context로 넘긴다.
- `Input` — `value?: string`, `onChange?(value: string)`, `allowClear?`, `type="password"`면 보기/숨기기 버튼, 나머지 `<input>` 속성.
- `NumberInput` — `value?: number | null`, `onChange?(value: number | null)`, `min?`, `max?`, `step?`(기본 1), `precision?`, `suffix?`(단위 덧붙임, UnitInputNumber 대체), `align?: "start" | "center"`. `type="text"` + `role="spinbutton"`. 입력 중에는 해석한 숫자를 그대로 알리고, 벗어날 때 범위 고정·자릿수 반올림, ↑/↓로 `step`만큼 바꾼다.
- `Select<V extends string>` — 네이티브 `<select>`. `value?`, `onChange?(value: V)`, `options: { value: V; label: string }[]`, `placeholder?`.
- `Segmented<V>` — 네이티브 라디오 묶음(`role="radiogroup"`). `value`, `onChange(value: V)`, `options: { value: V; label: ReactNode }[]`, `aria-label?`. Segmented와 Radio 버튼 묶음을 함께 대체한다.

### 겹침 화면

- `Modal` — `open`, `title`, `onClose`, `footer?`, `width?`(기본 520), `dismissible?`(기본 true: Esc·바깥 클릭·닫기 버튼). `role="dialog"`, `aria-modal`, 포커스 가두기·복원, 스크롤 잠금. 닫히면 내용을 언마운트한다.
- `Drawer` — 오른쪽 서랍. `open`, `title`, `onClose`, `extra?`, `width?`(기본 378).
- `UIProvider` — 앱 최상단. `useToast()` → `success/error(content, { key?, duration? })`(기본 3초, 같은 key는 교체). `useDialogs()` → `confirm({ title, content, okText, cancelText, onOk, okDisabled, width })`(onOk가 Promise면 확인 버튼 로딩, 실패하면 열린 채 둔다), `alert({ status: "info" | "error", title, content, okText, width })`.

### 표

- `Table<T>` — `columns: { key, title, render(record, index), width?, align?, ellipsis?, fixed?, sorter? }[]`, `data`, `rowKey(record)`, `loading?`, `size?: "small" | "medium"`, `emptyText?`.
  - `pagination?: false | { page?, pageSize?, total?, onChange?(page, pageSize), showSizeChanger? }` — `page`가 있으면 서버 쪽 페이지, 없으면 표가 직접 나눈다(기본 10개). 한 쪽에 다 들어가면 쪽 이동을 숨긴다. 쪽당 개수를 바꾸면 보던 쪽을 유지하고, 그 쪽이 사라지면 마지막 쪽으로 맞춘다.
  - `selection?: { selected: T[]; onChange(rows: T[]); label(record): string }` — 페이지를 넘겨도 선택을 유지한다.
  - `expandedRowRender?(record)`, `onRowClick?(record)`(키보드 Enter도 지원).
  - 정렬은 표 안에서만(오름 → 내림 → 해제, `aria-sort`). 열 너비 합으로 최소 너비를 잡고 넘치면 가로 스크롤한다.

## 6. antd → ui 대응

| antd                                      | ui                                                           |
| ----------------------------------------- | ------------------------------------------------------------ |
| `ConfigProvider`·`App`·`theme.useToken`   | `UIProvider`, `global.styles.ts` 토큰(`var(--ui-…)`)         |
| `App.useApp().message` / `.modal`         | `useToast()` / `useDialogs()`                                |
| `Space`·`Flex`                            | `Stack`                                                      |
| `Typography.Title/Text/Paragraph`         | `Title`/`Text`/`Paragraph`                                   |
| `Form`·`Form.Item`·`Form.List`·`useWatch` | `useForm` + `Field` + 배열 상태                              |
| `Input`·`Input.Search`·`Input.Password`   | `Input`(SearchBar는 Input + Button)                          |
| `InputNumber`·`UnitInputNumber`           | `NumberInput`(`suffix`)                                      |
| `Select` / `Radio.Group`·`Segmented`      | `Select` / `Segmented`                                       |
| `Table`                                   | `Table`                                                      |
| `Modal` / `Drawer`                        | `Modal` / `Drawer`                                           |
| `Badge`                                   | CartButton 안의 표시(사용처 1곳)                             |
| `Collapse`                                | 네이티브 `<details>`(사용처 1곳)                             |
| `Divider`                                 | `<hr>`                                                       |
| `Tooltip`                                 | `title` 속성(표의 `ellipsis` 열은 글자 칸에 자동으로 붙인다) |
| `Avatar`·`Image`                          | ItemImage 안의 `<img>` + 대체 그림                           |
| `Layout`·`Grid.useBreakpoint`             | CSS 미디어 쿼리                                              |
| `Empty`·`Result`·`Alert`·`Spin`           | 같은 이름의 ui 컴포넌트                                      |
| `@ant-design/icons`                       | `@/ui`의 아이콘                                              |

## 7. 단계와 검증

1. 기반: 토큰·전역 스타일, 아이콘, Button·Typography·Stack·Spin·Empty·Result·Alert, ESLint `ui` 영역.
2. 디자인 시스템 병렬 구현: 폼 컨트롤 / 겹침 화면 + UIProvider / 표. 사소하지 않은 동작(useForm, NumberInput, Overlay, toast·confirm, Table)은 테스트를 함께 둔다.
3. 사용처 교체: app / common·auth·walnut / product·manage / cart·market·result. 기존 테스트의 antd 의존(`ant-btn-loading`, `.ant-modal-wrap`, antd `App` 래퍼)은 역할·속성 기반으로 바꾼다.
4. 정리: `antd`·`@ant-design/icons` 제거, Vite 청크 그룹·경고 한도, ESLint 금지 목록, setupTests의 antd 대응 코드, README.
5. 검증: `typecheck` → `lint` → `format:check` → `test:ci` → `build`, 내장 브라우저로 주요 화면 확인.
6. emotion 전환: `<Name>.module.css`를 `<Name>.styles.ts`로 1:1 옮긴다. 다른 클래스를 가리키던 셀렉터(`.a.b`, `.a .b`)는 조건부 배열 항목이나 요소·속성 셀렉터로 바꾸고, 원본의 특이도·순서로 정해지던 승자를 유지한다. 같은 검증을 다시 돌린다.

## 8. 하지 않는 것

- 다크 모드, 컴포넌트 크기 변형, 애니메이션 퇴장 효과.
- antd Image의 확대 미리보기(이미 `preview={false}`로 꺼 두었다).
- 범용 Form 엔진(필드 등록·touched 추적·비동기 검증). 폼 4개는 `useForm`의 값·오류 객체로 충분하다.

## 9. 결과(번들 크기)

`pnpm build` 결과 파일을 `wc -c`와 `gzip -9`로 잰 값이다(바이트). 기준은 교체 전 커밋 `ca3fa7b`이다.
첫 화면은 `build/index.html`이 바로 불러오는 index·rolldown-runtime·react(교체 전에는 antd까지) 묶음이다.

| 파일                |       교체 전 | 교체 전 gzip |     교체 후 | 교체 후 gzip |
| ------------------- | ------------: | -----------: | ----------: | -----------: |
| index JS            |       125,773 |       42,187 |     149,016 |       49,934 |
| react JS            |       259,921 |       81,512 |     259,890 |       81,720 |
| antd JS             |       903,942 |      286,687 |        없음 |         없음 |
| rolldown-runtime JS |           726 |          460 |         726 |          460 |
| index CSS           |           513 |          365 |      19,093 |        4,328 |
| **첫 화면 합계**    | **1,290,875** |  **411,211** | **428,725** |  **136,442** |

- 첫 화면에서 받는 양은 gzip 기준 411,211바이트에서 136,442바이트로 약 67% 줄었다.
- 지연 로딩 묶음(관리 화면, xlsx)은 거의 그대로다. xlsx(494,216바이트)는 Vite 기본 경고 한도(500kB)보다 작아서 `chunkSizeWarningLimit`을 지웠다.
