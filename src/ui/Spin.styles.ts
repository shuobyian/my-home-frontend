import { css, keyframes } from "@emotion/react";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const styles = {
  spinner: css`
    display: inline-block;
    flex: none;
    width: 1em;
    height: 1em;
    vertical-align: -0.125em;
    border: var(--ui-focus-width) solid currentColor;
    border-right-color: transparent;
    border-radius: var(--ui-radius-full);
    animation: ${spin} 0.75s linear infinite;
  `,

  // spinner 뒤에 합쳐져야 border-width가 이긴다
  large: css`
    font-size: var(--ui-space-6);
    color: var(--ui-color-primary);
    border-width: 3px;
  `,

  standalone: css`
    display: flex;
    justify-content: center;
    padding: var(--ui-space-7) 0;
  `,

  container: css`
    position: relative;
  `,

  dimmed: css`
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
    transition: opacity var(--ui-motion);
  `,

  overlay: css`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  // 내용이 화면보다 길어도 보이는 곳의 세로 가운데에 머문다(내용 영역 밖으로는 나가지 않는다).
  // 회전 표시와 안쪽 여백을 합친 높이의 절반을 화면 가운데에서 뺀다
  floating: css`
    position: sticky;
    top: calc(50% - var(--ui-space-6) / 2 - var(--ui-space-3));
    bottom: calc(50% - var(--ui-space-6) / 2 - var(--ui-space-3));
    display: flex;
    padding: var(--ui-space-3);
    background: var(--ui-color-bg-container);
    border-radius: var(--ui-radius-full);
    box-shadow: var(--ui-shadow-md);
  `,
};
