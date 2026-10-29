import { breakpoints } from "@/ui";
import { css } from "@emotion/react";

export const styles = {
  header: css`
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-space-3);
    align-items: center;
    justify-content: space-between;
    padding: var(--ui-space-5) 0;

    @media (min-width: ${breakpoints.tablet}) {
      padding: var(--ui-space-6) 0;
    }
  `,
  homeLink: css`
    display: inline-flex;
    gap: var(--ui-space-3);
    align-items: center;
    color: var(--ui-color-text);
    border-radius: var(--ui-radius);

    &:hover {
      color: var(--ui-color-primary);
    }
  `,
  mark: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ui-space-8);
    height: var(--ui-space-8);
    font-size: var(--ui-icon-size-lg);
    color: var(--ui-color-text-inverse);
    background: var(--ui-color-primary);
    border-radius: var(--ui-radius-lg);
  `,
  eyebrow: css`
    display: block;
    font-size: var(--ui-font-size-sm);
    font-weight: var(--ui-font-weight-medium);
    color: var(--ui-color-text-secondary);
  `,
  title: css`
    margin: 0;
    font-size: var(--ui-font-size-2xl);
    letter-spacing: -0.04em;
  `,
  description: css`
    margin: 0;
    color: var(--ui-color-text-secondary);
  `,
};
