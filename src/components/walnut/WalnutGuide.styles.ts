import { css } from "@emotion/react";

export const styles = {
  // 넓으면 두 칸, 좁으면 한 칸으로 쌓는다
  sections: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: var(--ui-space-3);
  `,

  section: css`
    padding: var(--ui-space-3);
    background: var(--ui-color-bg-container);
    border-radius: var(--ui-radius-lg);
  `,

  sectionTitle: css`
    margin: 0 0 var(--ui-space-2);
    font-size: var(--ui-font-size-sm);
    color: var(--ui-color-text-secondary);
  `,

  list: css`
    display: grid;
    gap: var(--ui-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  `,

  // 이름과 효과 칩. 자리가 모자라면 칩이 다음 줄로 내려간다
  row: css`
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-space-1) var(--ui-space-2);
    align-items: center;
    justify-content: space-between;
  `,

  chips: css`
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-space-1);
  `,

  chip: css`
    padding: 0 var(--ui-space-2);
    font-size: var(--ui-font-size-sm);
    font-weight: 600;
    line-height: 22px;
    color: var(--ui-color-primary);
    white-space: nowrap;
    background: var(--ui-color-primary-bg);
    border-radius: 999px;
  `,

  link: css`
    display: inline-flex;
    gap: var(--ui-space-1);
    align-items: center;
    align-self: flex-start;
    font-weight: 600;
  `,
};
