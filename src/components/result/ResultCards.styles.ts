import { css } from "@emotion/react";

// 결과 카드 그리드. 카드 폭은 300px 이상으로, 한 줄에 놓을 장 수는 화면 너비에 맞춘다(좁으면 화면 폭 한 장).
// 모든 줄을 1fr로 두어 카드 높이를 목록에서 가장 큰 카드에 맞춘다(이름 길이와 상관없이 같은 크기).
// 입력칸이 없어 카드마다 흰 바탕과 테두리로 나눈다
export const styles = {
  name: css`
    margin: 0;
    font-size: var(--ui-font-size-md);
    line-height: var(--ui-line-height-heading);
  `,
  heading: css`
    display: flex;
    gap: var(--ui-space-2);
    align-items: center;
    margin-bottom: var(--ui-space-4);

    & h2 {
      margin: 0;
      font-size: var(--ui-font-size-md);
    }
  `,

  count: css`
    padding: var(--ui-space-0-5) var(--ui-space-2);
    font-size: var(--ui-font-size-sm);
    font-weight: var(--ui-font-weight-medium);
    font-variant-numeric: tabular-nums;
    color: var(--ui-color-text-secondary);
    background: var(--ui-color-bg-disabled);
    border-radius: var(--ui-radius-full);
  `,

  grid: css`
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(min(var(--ui-card-min-width), 100%), 1fr)
    );
    grid-auto-rows: 1fr;
    gap: var(--ui-space-5);
    padding: 0;
    margin: 0;
    list-style: none;
  `,

  // 사진이 카드 위쪽을 꽉 채우고, 둥근 모서리 밖은 잘라 낸다
  card: css`
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--ui-color-bg-container);
    border: 1px solid var(--ui-color-border-secondary);
    border-radius: var(--ui-radius-lg);
    box-shadow: var(--ui-shadow-sm);
    transition:
      border-color var(--ui-motion),
      box-shadow var(--ui-motion);

    &:hover,
    &:focus-within {
      border-color: var(--ui-color-primary-border);
      box-shadow: var(--ui-shadow-md);
    }
  `,

  // 사진 아래 내용. 남는 높이를 채워 버튼을 맨 아래로 보낸다
  body: css`
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--ui-space-4);
    padding: var(--ui-space-5);
    overflow-wrap: break-word;
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
      font-variant-numeric: tabular-nums;
    }

    & > dd:first-of-type {
      font-size: var(--ui-font-size-lg);
      line-height: var(--ui-line-height-heading);
    }
  `,

  // 카드 높이가 달라도 버튼은 카드 맨 아래에 맞춘다
  actions: css`
    display: flex;
    gap: var(--ui-space-2);
    justify-content: flex-end;
    margin-top: auto;

    & > button {
      flex: 1;
    }
  `,

  add: css`
    font-weight: var(--ui-font-weight-semibold);
    color: var(--ui-color-primary);
    background: var(--ui-color-primary-bg);
    border-color: var(--ui-color-primary-border);
  `,
};
