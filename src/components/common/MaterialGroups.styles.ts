import { css } from "@emotion/react";

// 재료 묶음마다 상자 하나(시세 조작 모드 시세 입력·관리자 시세 편집·보유 재료).
// 묶음마다 재료 수가 달라 격자로 놓으면 짧은 묶음 아래가 비므로, 다단(column)으로 위에서부터 채워 쌓는다.
// 단 수는 화면 너비에 맞추고, 묶음 상자는 단 사이에서 쪼개지 않는다.
// 입력칸마다 테두리가 있어 카드에는 상자를 두지 않고, 묶음마다 흰 바탕과 테두리로 구분한다
export const styles = {
  columns: css`
    column-width: 180px;
    column-gap: var(--ui-space-3);
  `,

  column: css`
    break-inside: avoid;
    margin-bottom: var(--ui-space-3);
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-3);
    padding: var(--ui-space-4);
    background: var(--ui-color-bg-container);
    border: 1px solid var(--ui-color-border);
    border-radius: var(--ui-radius-lg);
  `,

  list: css`
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-3);
    padding: 0;
    margin: 0;
    list-style: none;
  `,

  card: css`
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-1);
    overflow-wrap: break-word;
  `,
};
