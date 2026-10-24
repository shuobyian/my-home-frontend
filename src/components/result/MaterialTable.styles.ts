import { css } from "@emotion/react";

export const styles = {
  // 원래 값 옆의 '(N 부족)'. 작고 흐리게, 칸이 좁아도 중간에서 줄바꿈하지 않는다
  shortage: css`
    font-size: var(--ui-font-size-sm);
    color: var(--ui-color-text-secondary);
    white-space: nowrap;
  `,
};
