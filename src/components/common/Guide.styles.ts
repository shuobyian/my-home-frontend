import { css } from "@emotion/react";

export const styles = {
  // 연한 주 색 바탕의 카드. 버튼 옆에 서고, 둘이 한 줄에 들어가지 않으면 다음 줄에서 너비를 채운다.
  // 한글이 낱말 중간에서 끊기지 않도록 띄어쓰기에서 줄을 바꾼다
  guide: css`
    display: flex;
    flex: 1 1 320px;
    flex-direction: column;
    gap: var(--ui-space-3);
    min-width: 0;
    padding: var(--ui-space-4);
    word-break: keep-all;
    overflow-wrap: anywhere;
    background: var(--ui-color-primary-bg);
    border: 1px solid rgba(92, 53, 114, 0.12);
    border-radius: var(--ui-radius-xl);
  `,

  header: css`
    display: flex;
    gap: var(--ui-space-2);
    align-items: flex-start;
  `,

  icon: css`
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 16px;
    color: var(--ui-color-primary);
    background: var(--ui-color-bg-container);
    border-radius: 50%;
  `,

  // 28px 아이콘과 첫 줄의 가운데를 맞춘다(줄 높이 16px × 1.4)
  title: css`
    margin: 3px 0 0;
    font-size: 16px;
  `,

  // 번호 원은 제목 아이콘과 가운데를 맞추고(왼쪽 4px), 글은 번호 오른쪽에서 줄바꿈한다
  steps: css`
    display: grid;
    gap: var(--ui-space-2);
    margin: 0;
    padding: 0 0 0 4px;
    list-style: none;
    counter-reset: step;

    & > li {
      position: relative;
      padding-left: 28px;
      counter-increment: step;
    }

    & > li::before {
      position: absolute;
      top: 1px;
      left: 0;
      width: 20px;
      height: 20px;
      font-size: var(--ui-font-size-sm);
      font-weight: 600;
      line-height: 20px;
      color: var(--ui-color-text-inverse);
      text-align: center;
      content: counter(step);
      background: var(--ui-color-primary);
      border-radius: 50%;
    }
  `,
};
