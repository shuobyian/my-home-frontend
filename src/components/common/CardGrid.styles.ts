import { css } from "@emotion/react";

// 재료 카드 목록(자유 모드 시세 입력·관리자 시세 편집·보유 재료). 화면 너비에 맞춰 한 줄에 여러 장을 놓는다.
// 입력칸마다 테두리가 있어 카드에는 상자를 두지 않고, 흰 바탕 하나에 간격으로만 묶는다
export const styles = {
  grid: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--ui-space-4) var(--ui-space-3);
    padding: var(--ui-space-4);
    margin: 0;
    list-style: none;
    background: var(--ui-color-bg-container);
    border-radius: var(--ui-radius-lg);
  `,

  card: css`
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-1);
    overflow-wrap: break-word;
  `,
};
