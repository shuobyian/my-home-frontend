# 디자인 시스템

제작 계산기의 화면과 공용 UI는 `src/ui/tokens.ts`를 정본으로 사용한다. 기존 보라색 계열을 유지하면서 바탕, 글자, 테두리, 여백과 조작 상태를 같은 기준으로 맞춘다. 공용 컴포넌트는 새 UI 라이브러리 없이 React와 Emotion으로 구현한다.

## 토큰 계층과 정본

| 계층          | 내보내는 객체     | 역할                                        | 예                                                |
| ------------- | ----------------- | ------------------------------------------- | ------------------------------------------------- |
| 기본 값       | `primitiveTokens` | 팔레트, 간격, 글꼴, 모서리, 모션의 실제 값  | `--ui-palette-plum-700`, `--ui-space-4`           |
| 의미          | `semanticTokens`  | 사용 목적과 상태를 기본 값에 연결           | `--ui-color-primary`, `--ui-color-text-secondary` |
| 컴포넌트·배치 | `componentTokens` | 컨트롤, 카드, 본문, 메뉴에 쓰는 크기와 간격 | `--ui-control-height`, `--ui-page-gutter`         |

`designTokens`는 세 계층을 합친 객체다. `tokenDeclarations`가 CSS 변수 선언을 만들고, `global.styles.ts`를 통해 `UIProvider`가 `:root`에 한 번 적용한다. 각 컴포넌트는 CSS 변수로 값을 참조한다. 미디어 쿼리 조건에 필요한 `breakpoints`도 같은 정본에서 관리한다.

앱 화면은 `@/ui` 배럴에서 컴포넌트와 `breakpoints`를 가져온다. 팔레트의 색을 화면마다 직접 고르기보다 목적에 맞는 의미 토큰을 사용한다. 폼 너비처럼 특정 배치에만 필요한 값까지 임의로 공용 토큰으로 만들지는 않는다.

## 주요 값

| 구분                  | 토큰 또는 범위                                          | 현재 값                                                        |
| --------------------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| 주 색상               | `primary` / `hover` / `active`                          | `#5c326f` / `#704086` / `#482557`                              |
| 주 색상 배경          | `--ui-color-primary-bg`                                 | `#f7f2fa`                                                      |
| 본문 / 보조 글자      | `text` / `text-secondary`                               | `#302738` / `#6d6275`                                          |
| 컨테이너 / 전체 바탕  | `bg-container` / `bg-layout`                            | `#ffffff` / `#f6f5f8`                                          |
| 간격                  | `space-0-5`, `1`, `1-5`, `2`…`9`                        | `2`, `4`, `6`, `8`, `12`, `16`, `24`, `32`, `40`, `48`, `64px` |
| 글자 크기             | `xs`, `sm`, 기본, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl` | `11`, `12`, `14`, `16`, `18`, `20`, `24`, `28`, `36px`         |
| 글자 굵기             | `medium` / `semibold` / `bold`                          | `500` / `600` / `700`                                          |
| 행간                  | 기본 / `tight` / `heading`                              | `1.6` / `1.25` / `1.4`                                         |
| 모서리                | `sm`, 기본, `lg`, `xl`, `full`                          | `6`, `10`, `14`, `20`, `999px`                                 |
| 컨트롤 높이           | `--ui-control-height`                                   | `40px`                                                         |
| 입력 / 버튼 가로 패딩 | `control-padding-x` / `button-padding-x`                | `12px` / `16px`                                                |
| 아이콘                | `sm`, 기본, `lg`                                        | `16`, `20`, `24px`                                             |
| 본문 최대 너비        | `--ui-content-max-width`                                | `1280px`                                                       |
| 카드 최소 너비        | `--ui-card-min-width`                                   | `280px`                                                        |
| 메뉴 항목 크기        | `--ui-nav-item-size`                                    | `44px`                                                         |
| 모션 시간             | `duration-fast` / `duration-normal`                     | `140ms` / `200ms`                                              |
| 레이어 순서           | 메뉴 / 관리자 메뉴 / 대화상자 / 토스트                  | `10` / `11` / `1000` / `1100`                                  |

그림자는 `--ui-shadow-sm`, `--ui-shadow-md`, `--ui-shadow-lg`를 사용한다. 선택칸은 `--ui-shadow-segmented`, 포커스는 `--ui-focus-ring`을 사용한다. 장식 그림자와 키보드 포커스 표시를 같은 용도로 취급하지 않는다.

## 사용 예

```tsx
import { css } from "@emotion/react";
import { Button, Stack, Text, breakpoints } from "@/ui";

const panel = css`
  padding: var(--ui-space-4);
  color: var(--ui-color-text);
  background: var(--ui-color-bg-container);
  border: var(--ui-border-width) solid var(--ui-color-border-secondary);
  border-radius: var(--ui-radius-lg);

  @media (min-width: ${breakpoints.tablet}) {
    padding: var(--ui-space-5);
  }
`;

export function Example() {
  return (
    <section css={panel}>
      <Stack vertical gap='var(--ui-space-3)'>
        <Text tone='secondary'>변경한 내용을 저장합니다.</Text>
        <Button variant='primary'>저장</Button>
      </Stack>
    </section>
  );
}
```

`Stack`의 숫자 `gap`은 기존처럼 px 단위로 동작하며 CSS 변수 문자열도 받는다. 기본값은 `var(--ui-space-2)`다. 카드의 내부 패딩은 카드가, 카드 사이 간격은 바깥 `Stack`이나 grid가 정하도록 한다.

## 컴포넌트 상태와 접근성

| 컴포넌트                                  | 기본 표현과 상태                                              | 보존할 동작                                                                                                                               |
| ----------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                  | `default`·`primary`, `danger`, hover·active·disabled·loading  | 기본 `type=button`. loading은 포커스를 유지하고 클릭·제출을 막으며 `aria-busy`를 전달한다. 아이콘만 있으면 호출부가 접근 이름을 제공한다. |
| `Input`·`NumberInput`·`Select`·`TextArea` | 공통 테두리·포커스·오류·비활성 상태. 한 줄 컨트롤 높이 `40px` | `Field`를 통해 라벨과 오류·도움말을 연결한다. 네이티브 입력과 Select의 키보드 동작을 유지한다.                                            |
| `Field`                                   | 라벨, 필수 표시, 도움말, 오류, inline 배치                    | `id`, `aria-required`, `aria-invalid`, `aria-describedby`를 전달한다. 오류는 `role=alert`로 알린다.                                       |
| `Segmented`                               | 선택·hover·disabled·invalid 상태                              | 네이티브 라디오로 화살표 키 이동을 제공하고 포커스 외곽선을 표시한다.                                                                     |
| `Table`                                   | 일반·작은 패딩, 정렬, 선택, 펼침, 고정 열, 페이지 이동        | 선택·정렬·펼침 버튼과 클릭 가능한 행의 키보드 동작 및 상태 속성을 유지한다. 넓은 표는 가로 스크롤한다.                                    |
| `Modal`·`Drawer`                          | 공통 배경·그림자·제목·닫기 버튼                               | 대화상자 이름, 포커스 가두기·복원, Esc 처리와 스크롤 잠금을 유지한다. 닫을 수 없는 모달은 저장 중에도 임의로 닫히지 않는다.               |
| `Alert`·`Result`·`Empty`·토스트           | 의미 색상과 공통 타이포·간격                                  | 오류는 텍스트와 아이콘을 함께 제공한다. 토스트·로딩의 기존 상태 알림을 유지한다.                                                          |

문서의 제목 단계는 시각적 크기만으로 정하지 않고 문서 구조에 맞춰 선택한다. `Title`은 제목 단계와 공통 타이포 스케일을 연결한다. `prefers-reduced-motion` 설정에서는 전역 스타일이 애니메이션과 전환 시간을 줄인다.

## 반응형 기준

| 구간                   | 동작                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `768px` 미만           | 기본 좌우 여백 `16px`. 주 메뉴는 화면 아래에 배치하고 본문은 메뉴·기기 하단 안전 영역을 위한 여백을 확보한다. |
| `tablet: 768px` 이상   | 기본 좌우 여백 `24px`. 주 메뉴를 화면 위로 옮기며 관리자 메뉴용 오른쪽 공간을 확보한다.                       |
| `desktop: 1024px` 이상 | 메뉴 아이콘과 이름을 함께 보여 준다.                                                                          |
| `wide: 1280px` 이상    | 기본 좌우 여백 `32px`. 본문 최대 너비는 계속 `1280px`다.                                                      |

미디어 쿼리 조건에는 CSS 변수를 쓸 수 없으므로 `breakpoints.tablet` 같은 상수를 보간한다. 모바일 모달은 별도로 상단 여백을 줄이며, 표·목록은 내용에 맞는 줄바꿈과 스크롤을 사용한다.

## 값을 바꾸는 방법

1. 변경 목적이 전체 팔레트, 특정 의미, 특정 컴포넌트 중 어디에 속하는지 결정하고 `tokens.ts`의 해당 계층을 수정한다.
2. 화면은 새 색상 리터럴을 추가하기보다 기존 의미 토큰을 참조한다. 새 상태가 필요하면 글자·배경·테두리의 사용 목적을 함께 정한다.
3. 배경 `--ui-color-bg-layout`을 바꾸면 `index.html`의 초기 배경도 맞춘다. 앱 스타일을 받기 전 첫 화면의 배경이 달라지는 것을 방지한다.
4. 공용 컨트롤 높이를 바꾸면 입력, 버튼, Segmented, 페이지 이동 버튼을 함께 확인한다. 메뉴 높이는 별도 컴포넌트 토큰에서 계산된다.
5. `pnpm test:ci tests/designTokens.test.ts`로 토큰 참조와 글자 대비를 확인한다. 이후 프로젝트의 typecheck·lint·format·전체 테스트·build와 실제 화면 확인을 진행한다.

`tests/designTokens.test.ts`는 계층 사이 이름 중복, 토큰의 미선언·순환 참조, `src` 안의 CSS 변수 참조를 검사한다. 일반·보조 글자의 기본 바탕 조합, placeholder와 입력 바탕, 의미색과 각 배경·흰 배경, 흰 글자와 primary·hover·active·danger·danger-hover를 합쳐 **30개 색상 조합**의 대비가 **4.5:1 이상**인지 계산한다. 비활성 글자는 일반 본문 대비 검사에 포함하지 않는다. 이 검사는 실제 화면의 모든 글자·이미지·반투명 합성까지 검사하는 접근성 감사와는 범위가 다르다.

## 기존 코드와 적용 범위

기존 `--ui-color-*`, `--ui-space-1`…`--ui-space-6`, `--ui-radius`, `--ui-font-size`, `--ui-motion`, `--ui-shadow` 이름을 유지한다. 기존 `--ui-shadow`는 `--ui-shadow-lg`의 별칭이다. 공용 컴포넌트의 기존 props와 접근성 동작도 유지한다. `Stack.gap`만 CSS 변수 문자열을 추가로 허용한다.

이 변경의 범위는 현재 밝은 테마의 공통 토큰과 기존 화면 적용이다. 다크 모드, 테마 선택 UI, 새 크기 변형 API는 추가하지 않는다. 과거 라이브러리 교체 계획은 `design-system-plan.md`에 남기고, 현재 토큰 값과 사용 규칙은 이 문서와 `tokens.ts`를 기준으로 한다.
