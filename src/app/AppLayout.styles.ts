import { css } from "@emotion/react";

export const styles = {
  // 576px 이상(sm)에서는 좌우 여백을 넓힌다
  layout: css`
    display: flex;
    flex-direction: column;
    padding: 10px;

    @media (min-width: 576px) {
      padding: 10px 100px;
    }
  `,
};
