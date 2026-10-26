import { css } from "@emotion/react";

// 결과 카드 그리드. 카드 폭은 220px 이상으로, 한 줄에 놓을 장 수는 화면 너비에 맞춘다(좁으면 화면 폭 한 장).
// 입력칸이 없어 카드마다 흰 바탕과 테두리로 나눈다
export const styles = {
  grid: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
    gap: var(--ui-space-3);
    padding: 0;
    margin: 0;
    list-style: none;
  `,

  card: css`
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-3);
    padding: var(--ui-space-4);
    overflow-wrap: break-word;
    background: var(--ui-color-bg-container);
    border: 1px solid var(--ui-color-border-secondary);
    border-radius: var(--ui-radius-lg);
  `,

  head: css`
    display: flex;
    gap: var(--ui-space-3);
    align-items: center;
  `,

  // 긴 물품명이 사진을 밀어내지 않고 줄바꿈되도록
  headText: css`
    min-width: 0;
  `,

  costs: css`
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--ui-space-1) var(--ui-space-3);
    padding-top: var(--ui-space-3);
    margin: 0;
    border-top: 1px solid var(--ui-color-border-secondary);

    & > dt {
      color: var(--ui-color-text-secondary);
    }

    & > dd {
      margin: 0;
      text-align: right;
    }
  `,

  materials: css`
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-space-1);
  `,

  material: css`
    padding: 0 var(--ui-space-2);
    font-size: var(--ui-font-size-sm);
    line-height: 22px;
    color: var(--ui-color-primary);
    background: var(--ui-color-primary-bg);
    border-radius: var(--ui-radius-sm);
  `,

  // 재료 수가 달라 카드 높이가 달라도 버튼은 카드 맨 아래에 맞춘다
  actions: css`
    display: flex;
    gap: var(--ui-space-2);
    justify-content: flex-end;
    margin-top: auto;
  `,
};
