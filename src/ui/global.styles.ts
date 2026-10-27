import { css } from "@emotion/react";

// UIProvider가 <Global>로 한 번 넣는다.
// - :root: 디자인 토큰. 컴포넌트와 화면은 값 대신 이 변수를 쓴다.
//   상태 글자색(success·warning·danger·info)은 흰 배경과 4.5:1 이상 대비가 나는 값이다.
//   bg-layout을 바꾸면 index.html의 첫 화면 색도 바꾼다.
// - a: 기본 파란 밑줄 대신 주 색으로
// - :focus-visible: 키보드 포커스 표시. 미지원 브라우저는 기본 외곽선이 그대로 보인다(이 규칙만 따로 둔다)
// - .ui-sr-only: 화면에서는 숨기고 스크린 리더에는 읽힌다
export const globalStyles = css`
  :root {
    --ui-color-primary: #5c3572;
    --ui-color-primary-hover: #75508a;
    --ui-color-primary-active: #462657;
    --ui-color-primary-bg: #f4eff7;

    --ui-color-text: rgba(0, 0, 0, 0.88);
    --ui-color-text-secondary: rgba(0, 0, 0, 0.65);
    --ui-color-text-placeholder: rgba(0, 0, 0, 0.4);
    --ui-color-text-disabled: rgba(0, 0, 0, 0.25);
    --ui-color-text-inverse: #fff;

    --ui-color-success: #237804;
    --ui-color-warning: #ad6800;
    --ui-color-danger: #cf1322;
    --ui-color-danger-hover: #f5222d;
    --ui-color-info: #0958d9;
    --ui-color-error-bg: #fff2f0;
    --ui-color-error-border: #ffccc7;
    --ui-color-warning-bg: #fffbe6;

    --ui-color-bg-container: #fff;
    --ui-color-bg-layout: #f5f5f5;
    --ui-color-bg-disabled: rgba(0, 0, 0, 0.04);
    --ui-color-fill-alter: #fafafa;
    --ui-color-border: #d9d9d9;
    --ui-color-border-secondary: #f0f0f0;
    --ui-color-mask: rgba(0, 0, 0, 0.45);

    --ui-space-1: 4px;
    --ui-space-2: 8px;
    --ui-space-3: 12px;
    --ui-space-4: 16px;
    --ui-space-5: 24px;
    --ui-space-6: 32px;

    --ui-radius-sm: 4px;
    --ui-radius: 6px;
    --ui-radius-lg: 8px;
    --ui-radius-xl: 10px;

    --ui-font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Helvetica Neue",
      Arial, sans-serif;
    --ui-font-family-code:
      source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
    --ui-font-size: 14px;
    --ui-font-size-sm: 12px;
    --ui-line-height: 1.5715;

    --ui-control-height: 32px;
    --ui-focus-ring: 0 0 0 2px rgba(92, 53, 114, 0.2);

    --ui-shadow:
      0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);
    --ui-z-overlay: 1000;
    --ui-z-toast: 1100;
    --ui-motion: 0.2s ease;
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
    outline: 2px solid var(--ui-color-primary);
    outline-offset: 2px;
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
