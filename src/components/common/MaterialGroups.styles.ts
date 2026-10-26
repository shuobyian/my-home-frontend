import { css } from "@emotion/react";

// 재료 묶음마다 세로 열 하나(자유 모드 시세 입력·관리자 시세 편집·보유 재료).
// 열은 화면 너비에 맞춰 한 줄에 여러 개를 놓고, 묶음마다 재료 수가 달라 열 높이가 다르므로 위쪽에 맞춘다.
// 입력칸마다 테두리가 있어 카드에는 상자를 두지 않고, 열마다 흰 바탕 하나에 간격으로만 묶는다
export const styles = {
  columns: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--ui-space-3);
    align-items: start;
  `,

  column: css`
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-3);
    padding: var(--ui-space-4);
    background: var(--ui-color-bg-container);
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
