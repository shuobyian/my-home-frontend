import { css, keyframes } from "@emotion/react";

const toastIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(calc(-1 * var(--ui-space-2)));
  }
`;

export const styles = {
  toasts: css`
    position: fixed;
    top: var(--ui-space-2);
    right: 0;
    left: 0;
    z-index: var(--ui-z-toast);
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-2);
    align-items: center;
    padding: 0 var(--ui-space-4);
    pointer-events: none;
  `,

  toast: css`
    display: flex;
    align-items: center;
    max-width: 100%;
    gap: var(--ui-space-2);
    min-height: var(--ui-control-height);
    padding: var(--ui-space-3) var(--ui-space-4);
    background: var(--ui-color-bg-container);
    border: var(--ui-border-width) solid var(--ui-color-border-secondary);
    border-radius: var(--ui-radius-lg);
    box-shadow: var(--ui-shadow-md);
    pointer-events: auto;
    animation: ${toastIn} var(--ui-motion);
  `,

  icon: css`
    display: inline-flex;
    flex: none;
    vertical-align: -0.125em;
  `,

  success: css`
    color: var(--ui-color-success);
  `,

  error: css`
    color: var(--ui-color-danger);
  `,

  warning: css`
    color: var(--ui-color-warning);
  `,

  info: css`
    color: var(--ui-color-info);
  `,
};
