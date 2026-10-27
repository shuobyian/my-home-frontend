import { css } from "@emotion/react";

// 필요 재료: 열 제목 한 줄 + 재료마다 한 줄(물품명·하위재료 여부·개수·줄 추가/삭제)을 같은 열 폭으로 맞춘다
export const styles = {
  sectionLabel: css`
    padding-bottom: 6px;
    font-weight: 500;
  `,

  // ponytail: 좁은 화면(모바일)에서는 줄을 접지 않고 이 영역만 가로로 스크롤한다. 모바일 관리가 잦아지면 줄을 두 줄로 접는다.
  // padding·margin은 가장자리 칸의 포커스 테두리가 스크롤 영역에 잘리지 않게 하는 여유
  materials: css`
    display: grid;
    grid-template-columns: minmax(140px, 1fr) max-content 120px max-content;
    gap: var(--ui-space-2);
    align-items: start;
    padding: 2px;
    margin: -2px;
    overflow-x: auto;
  `,

  columnTitle: css`
    font-size: var(--ui-font-size-sm);
    color: var(--ui-color-text-secondary);
  `,

  actions: css`
    display: flex;
    gap: var(--ui-space-2);
  `,

  // 재료 참조 경고는 줄 전체 폭으로 그 재료 아래에 둔다
  fullRow: css`
    grid-column: 1 / -1;
    margin-top: calc(-1 * var(--ui-space-1));
  `,
};
