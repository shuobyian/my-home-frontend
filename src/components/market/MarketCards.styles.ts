import { css } from "@emotion/react";

// 시세 카드 목록(자유 모드 입력·관리자 편집). 화면 너비에 맞춰 한 줄에 여러 장을 놓는다
export const styles = {
  grid: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--ui-space-3);
    padding: 0;
    margin: 0;
    list-style: none;
  `,

  card: css`
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-2);
    padding: var(--ui-space-3);
    overflow-wrap: break-word;
    background: var(--ui-color-bg-container);
    border: 1px solid var(--ui-color-border-secondary);
    border-radius: var(--ui-radius-lg);
  `,
};
