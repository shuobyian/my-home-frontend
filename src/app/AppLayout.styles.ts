import { css } from "@emotion/react";

export const styles = {
  // 576px 이상(sm)에서는 좌우 여백을 넓힌다.
  // 화면 높이를 채워 화면(로그인 등)이 남은 높이 안에서 가운데 정렬할 수 있게 한다(dvh를 모르는 브라우저는 vh)
  layout: css`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
    padding: 10px;

    @media (min-width: 576px) {
      padding: 10px 100px;
    }
  `,
};
