import { css } from "@emotion/react";
import { tokenDeclarations } from "./tokens";

// UIProvider가 <Global>로 한 번 넣는다.
// - :root: tokens.ts의 디자인 토큰. 컴포넌트와 화면은 값 대신 이 변수를 쓴다.
//   상태 글자색(success·warning·danger·info)은 흰 배경과 4.5:1 이상 대비가 나는 값이다.
//   bg-layout을 바꾸면 index.html의 첫 화면 색도 바꾼다.
// - a: 기본 파란 밑줄 대신 주 색으로
// - :focus-visible: 키보드 포커스 표시. 미지원 브라우저는 기본 외곽선이 그대로 보인다(이 규칙만 따로 둔다)
// - .ui-sr-only: 화면에서는 숨기고 스크린 리더에는 읽힌다
export const globalStyles = css`
  :root {
    ${tokenDeclarations}
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: var(--ui-font-family);
    font-size: var(--ui-font-size);
    line-height: var(--ui-line-height);
    color: var(--ui-color-text);
    background: var(--ui-color-bg-layout);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
    font-family: var(--ui-font-family-code);
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
  }

  hr {
    margin: var(--ui-space-5) 0;
    border: 0;
    border-top: 1px solid var(--ui-color-border-secondary);
  }

  a {
    color: var(--ui-color-primary);
    text-decoration: none;
  }

  a:hover {
    color: var(--ui-color-primary-hover);
  }

  :focus-visible {
    outline: var(--ui-focus-width) solid var(--ui-color-primary);
    outline-offset: var(--ui-focus-width);
  }

  .ui-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
