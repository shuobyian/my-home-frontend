import { css } from "@emotion/react";
import { breakpoints } from "@/ui";

export const styles = {
  // 연한 주 색 바탕의 카드. 첫 줄은 아이콘·제목(768px 이상은 버튼까지), 그 아래로 내용이 온다.
  // 한글이 낱말 중간에서 끊기지 않도록 띄어쓰기에서 줄을 바꾼다
  guide: css`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--ui-space-4) var(--ui-space-3);
    align-items: start;
    padding: var(--ui-space-4);
    word-break: keep-all;
    overflow-wrap: anywhere;
    background: var(--ui-color-primary-bg);
    border: var(--ui-border-width) solid var(--ui-color-primary-border);
    border-radius: var(--ui-radius-lg);

    @media (min-width: ${breakpoints.tablet}) {
      grid-template-columns: auto minmax(0, 1fr) auto;
      padding: var(--ui-space-5);
    }
  `,

  // 768px 미만은 order로 내용 뒤(카드 맨 아래)에 놓는다
  action: css`
    grid-column: 1 / -1;
    order: 1;
    justify-self: end;

    @media (min-width: ${breakpoints.tablet}) {
      grid-column: auto;
      order: 0;
    }
  `,

  body: css`
    display: flex;
    grid-column: 1 / -1;
    flex-direction: column;
    gap: var(--ui-space-3);
  `,

  icon: css`
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: var(--ui-space-6);
    height: var(--ui-space-6);
    font-size: var(--ui-icon-size-sm);
    color: var(--ui-color-primary);
    background: var(--ui-color-bg-container);
    border-radius: 50%;
  `,

  // 제목과 아이콘의 세로 가운데를 맞춘다
  title: css`
    align-self: center;
    margin: 0;
    font-size: var(--ui-font-size-md);
  `,

  // 글이 번호 오른쪽에서 줄바꿈되도록 왼쪽 공간을 비운다
  steps: css`
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(min(100%, var(--ui-card-min-width)), 1fr)
    );
    gap: var(--ui-space-3) var(--ui-space-5);
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: step;

    & > li {
      position: relative;
      padding-left: var(--ui-space-6);
      counter-increment: step;
    }

    & > li::before {
      position: absolute;
      top: 1px;
      left: 0;
      width: var(--ui-badge-size);
      height: var(--ui-badge-size);
      font-size: var(--ui-font-size-sm);
      font-weight: var(--ui-font-weight-semibold);
      line-height: var(--ui-badge-size);
      color: var(--ui-color-primary);
      text-align: center;
      content: counter(step);
      background: var(--ui-color-bg-container);
      border-radius: 50%;
    }
  `,
};
