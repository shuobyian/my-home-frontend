import { css } from "@emotion/react";

export const styles = {
  title: css`
    margin: 0 0 0.5em;
    font-weight: var(--ui-font-weight-semibold);
    letter-spacing: -0.025em;
    color: var(--ui-color-text);
  `,

  h1: css`
    font-size: var(--ui-font-size-4xl);
    line-height: var(--ui-line-height-tight);
  `,

  h2: css`
    font-size: var(--ui-font-size-3xl);
    line-height: var(--ui-line-height-tight);
  `,

  h3: css`
    font-size: var(--ui-font-size-2xl);
    line-height: var(--ui-line-height-heading);
  `,

  h4: css`
    font-size: var(--ui-font-size-xl);
    line-height: var(--ui-line-height-heading);
  `,

  h5: css`
    font-size: var(--ui-font-size-md);
    line-height: var(--ui-line-height-heading);
  `,

  paragraph: css`
    margin: 0 0 1em;
  `,

  strong: css`
    font-weight: var(--ui-font-weight-semibold);
  `,

  secondary: css`
    color: var(--ui-color-text-secondary);
  `,

  success: css`
    color: var(--ui-color-success);
  `,

  warning: css`
    color: var(--ui-color-warning);
  `,

  danger: css`
    color: var(--ui-color-danger);
  `,

  info: css`
    color: var(--ui-color-info);
  `,
};
