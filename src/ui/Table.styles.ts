import { css } from "@emotion/react";

export const styles = {
  scroll: css`
    overflow-x: auto;
    background: var(--ui-color-bg-container);
    border-radius: var(--ui-radius-lg);
  `,

  // border-collapse는 separate라야 고정(sticky) 칸의 테두리가 함께 붙어 다닌다.
  // 칸 규칙은 펼친 행 안에 표가 또 들어갈 수 있어 자기 칸에만 적용한다
  table: css`
    width: 100%;
    border-spacing: 0;
    border-collapse: separate;

    & > thead > tr > th,
    & > tbody > tr > td {
      padding: var(--ui-space-4);
      text-align: left;
      overflow-wrap: break-word;
      border-bottom: 1px solid var(--ui-color-border-secondary);
    }

    & > thead > tr > th {
      font-weight: 600;
      background: var(--ui-color-fill-alter);
    }
  `,

  // table 뒤에 둔다(같은 특이도라 칸 여백을 덮는다)
  small: css`
    & > thead > tr > th,
    & > tbody > tr > td {
      padding: var(--ui-space-2);
    }
  `,

  fixedLayout: css`
    table-layout: fixed;
  `,

  row: css`
    & > td {
      background: var(--ui-color-bg-container);
      transition: background-color var(--ui-motion);
    }

    &:hover > td {
      background: var(--ui-color-fill-alter);
    }
  `,

  // row 뒤에 둔다(같은 특이도라 배경을 덮는다)
  selected: css`
    & > td,
    &:hover > td {
      background: var(--ui-color-primary-bg);
    }
  `,

  // tr의 outline은 고정(sticky) 칸 밑에 가려지므로 포커스는 칸마다 안쪽 그림자로 그린다
  clickable: css`
    cursor: pointer;

    &:focus-visible {
      outline: none;
    }

    &:focus-visible > td {
      box-shadow:
        inset 0 2px var(--ui-color-primary),
        inset 0 -2px var(--ui-color-primary);
    }

    &:focus-visible > td:first-child {
      box-shadow:
        inset 2px 0 var(--ui-color-primary),
        inset 0 2px var(--ui-color-primary),
        inset 0 -2px var(--ui-color-primary);
    }

    &:focus-visible > td:last-child {
      box-shadow:
        inset -2px 0 var(--ui-color-primary),
        inset 0 2px var(--ui-color-primary),
        inset 0 -2px var(--ui-color-primary);
    }

    &:focus-visible > td:only-child {
      box-shadow: inset 0 0 0 2px var(--ui-color-primary);
    }
  `,

  expandedRow: css`
    & > td {
      background: var(--ui-color-fill-alter);
    }
  `,

  ellipsis: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  fixed: css`
    position: sticky;
    z-index: 1;
  `,

  // 선택·펼침 열. 표가 칸에 주는 왼쪽 정렬(클래스 하나+요소 셋)을 이기도록 &&로 클래스 둘의 특이도를 준다
  extra: css`
    && {
      text-align: center;
    }
  `,

  checkbox: css`
    margin: 0;
    vertical-align: middle;
    cursor: pointer;
    accent-color: var(--ui-color-primary);
  `,

  expandButton: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    font-size: 12px;
    vertical-align: middle;
    cursor: pointer;
    background: var(--ui-color-bg-container);
    border: 1px solid var(--ui-color-border);
    border-radius: var(--ui-radius-sm);
    transition:
      color var(--ui-motion),
      border-color var(--ui-motion);

    &:hover {
      color: var(--ui-color-primary);
      border-color: var(--ui-color-primary);
    }
  `,

  sorter: css`
    display: inline-flex;
    gap: var(--ui-space-1);
    align-items: center;
    padding: 0;
    font-weight: inherit;
    cursor: pointer;
    background: none;
    border: 0;
  `,

  sortIcon: css`
    display: inline-flex;
    flex-direction: column;
    font-size: 8px;
    line-height: 1.1;
    color: var(--ui-color-text-disabled);
  `,

  sortActive: css`
    color: var(--ui-color-primary);
  `,

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
