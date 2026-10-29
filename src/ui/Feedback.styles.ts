import { css } from "@emotion/react";

export const styles = {
  empty: css`
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-2);
    align-items: center;
    padding: var(--ui-space-6) var(--ui-space-4);
    color: var(--ui-color-text-secondary);
    text-align: center;
  `,

  emptyImage: css`
    font-size: var(--ui-space-7);
    line-height: 1;
    color: var(--ui-color-border);
  `,

  result: css`
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-2);
    align-items: center;
    padding: var(--ui-space-8) var(--ui-space-6);
    text-align: center;
  `,

  resultIcon: css`
    margin-bottom: var(--ui-space-4);
    font-size: var(--ui-space-9);
    font-weight: var(--ui-font-weight-bold);
    line-height: 1;
  `,

  notFound: css`
    color: var(--ui-color-primary);
  `,

  warning: css`
    color: var(--ui-color-warning);
  `,

  error: css`
    color: var(--ui-color-danger);
  `,

  resultTitle: css`
    margin: 0;
    font-size: var(--ui-font-size-2xl);
    font-weight: var(--ui-font-weight-semibold);
    line-height: var(--ui-line-height-heading);
  `,

  resultDescription: css`
    color: var(--ui-color-text-secondary);
  `,

  resultActions: css`
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-space-2);
    justify-content: center;
    margin-top: var(--ui-space-5);
  `,

  alert: css`
    display: flex;
    gap: var(--ui-space-2);
    align-items: flex-start;
    padding: var(--ui-space-2) var(--ui-space-3);
    background: var(--ui-color-error-bg);
    border: var(--ui-border-width) solid var(--ui-color-error-border);
    border-radius: var(--ui-radius-lg);
  `,

  alertIcon: css`
    flex: none;
    margin-top: 0.2em;
    color: var(--ui-color-danger);
  `,

  // alert 뒤에 둔다(padding이 이겨야 한다)
  alertWithDescription: css`
    padding: var(--ui-space-4) var(--ui-space-5);
  `,

  // 설명이 있을 때 제목. 원래 .alertWithDescription .alertTitle이라 제목 요소에 같은 조건으로 붙인다
  alertTitleWithDescription: css`
    margin-bottom: var(--ui-space-1);
    font-size: var(--ui-font-size-md);
  `,
};
