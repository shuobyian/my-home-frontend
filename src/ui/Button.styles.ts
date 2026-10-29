import { css } from "@emotion/react";

export const styles = {
  // aria-busy·disabled 상태는 종류별 스타일(한 단계 낮은 특이도)보다 먼저 와도 이긴다
  button: css`
    display: inline-flex;
    flex: none;
    gap: var(--ui-space-2);
    align-items: center;
    justify-content: center;
    height: var(--ui-control-height);
    padding: 0 var(--ui-button-padding-x);
    font-weight: var(--ui-font-weight-medium);
    line-height: 1;
    color: var(--ui-color-text);
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    background: var(--ui-color-bg-container);
    border: var(--ui-border-width) solid var(--ui-color-border);
    border-radius: var(--ui-radius);
    transition:
      color var(--ui-motion),
      background-color var(--ui-motion),
      border-color var(--ui-motion);

    &[aria-busy="true"] {
      cursor: progress;
      opacity: var(--ui-opacity-busy);
    }

    &:disabled {
      color: var(--ui-color-text-disabled);
      cursor: not-allowed;
      background: var(--ui-color-bg-disabled);
      border-color: var(--ui-color-border);
    }
  `,

  default: css`
    &:hover:not(:disabled) {
      color: var(--ui-color-primary-hover);
      background: var(--ui-color-bg-hover);
      border-color: var(--ui-color-primary-hover);
    }

    &:active:not(:disabled) {
      color: var(--ui-color-primary-active);
      border-color: var(--ui-color-primary-active);
    }
  `,

  primary: css`
    color: var(--ui-color-text-inverse);
    background: var(--ui-color-primary);
    border-color: var(--ui-color-primary);

    &:hover:not(:disabled) {
      background: var(--ui-color-primary-hover);
      border-color: var(--ui-color-primary-hover);
    }

    &:active:not(:disabled) {
      background: var(--ui-color-primary-active);
      border-color: var(--ui-color-primary-active);
    }
  `,

  danger: css`
    color: var(--ui-color-danger);
    border-color: var(--ui-color-danger);

    &:hover:not(:disabled) {
      color: var(--ui-color-danger-hover);
      border-color: var(--ui-color-danger-hover);
    }
  `,

  // primary와 danger를 함께 쓸 때. danger 뒤에 둔다
  primaryDanger: css`
    color: var(--ui-color-text-inverse);
    background: var(--ui-color-danger);

    &:hover:not(:disabled) {
      color: var(--ui-color-text-inverse);
      background: var(--ui-color-danger-hover);
    }

    &:active:not(:disabled) {
      background: var(--ui-color-danger-hover);
      border-color: var(--ui-color-danger-hover);
    }
  `,

  iconOnly: css`
    width: var(--ui-control-height);
    padding: 0;
  `,
};
