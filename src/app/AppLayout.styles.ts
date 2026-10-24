import { css } from "@emotion/react";
import { NAV_BAR_HEIGHT } from "./AppNav.styles";

export const styles = {
  // 768px 이상에서는 메뉴(왼쪽 줄·사이드바)와 본문이 가로로 나란히 서고, 미만에서는 메뉴가 아래 탭 막대가 된다.
  // 화면 높이를 채워 화면(로그인 등)이 남은 높이 안에서 가운데 정렬할 수 있게 한다(dvh를 모르는 브라우저는 vh)
  layout: css`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;

    @media (min-width: 768px) {
      flex-direction: row;
    }
  `,

  // 메뉴 옆의 본문 영역. 좁은 화면에서는 탭 막대에 가리지 않도록 그 높이만큼 아래 여백을 둔다.
  // 768px 이상은 좌우 여백을 넓히고, 1280px 이상은 더 넓힌다.
  content: css`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    padding: 10px 10px
      calc(${NAV_BAR_HEIGHT} + env(safe-area-inset-bottom) + 10px);

    @media (min-width: 768px) {
      padding: 10px 24px;
    }

    @media (min-width: 1280px) {
      padding: 10px 64px;
    }
  `,
};
