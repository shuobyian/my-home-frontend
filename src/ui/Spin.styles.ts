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
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: ${spin} 0.75s linear infinite;
  `,

  // spinner 뒤에 합쳐져야 border-width가 이긴다
  large: css`
    font-size: 32px;
    color: var(--ui-color-primary);
    border-width: 3px;
  `,

  standalone: css`
    display: flex;
    justify-content: center;
    padding: 40px 0;
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
  // 28px은 지름(회전 표시 32px + 안쪽 여백)의 절반
  floating: css`
    position: sticky;
    top: calc(50% - 28px);
    bottom: calc(50% - 28px);
    display: flex;
    padding: 12px;
    background: var(--ui-color-bg-container);
    border-radius: 50%;
    box-shadow: var(--ui-shadow);
  `,
};
