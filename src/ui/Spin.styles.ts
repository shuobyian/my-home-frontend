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
};
