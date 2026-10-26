import { css } from "@emotion/react";

export const styles = {
  pager: css`
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-space-2);
    align-items: center;
    justify-content: flex-end;
    margin-top: var(--ui-space-4);
  `,

  pageButton: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--ui-control-height);
    height: var(--ui-control-height);
    padding: 0 6px;
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--ui-radius);
    transition: background-color var(--ui-motion);

    &:hover:not(:disabled) {
      background: var(--ui-color-bg-layout);
    }

    &[aria-current="page"] {
      font-weight: 600;
      color: var(--ui-color-primary);
      background: var(--ui-color-bg-container);
      border-color: var(--ui-color-primary);
    }

    &:disabled {
      color: var(--ui-color-text-disabled);
      cursor: not-allowed;
    }
  `,

  pageGap: css`
    min-width: var(--ui-control-height);
    color: var(--ui-color-text-secondary);
    text-align: center;
  `,

  // 모양은 Select 그대로, 폭만 글자에 맞춘다
  sizeSelect: css`
    width: auto;
  `,
};
