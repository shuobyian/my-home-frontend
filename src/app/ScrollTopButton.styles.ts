import { css } from "@emotion/react";
import { NAV_BAR_SPACE } from "./AppNav.styles";

export const styles = {
  // 오른쪽 아래에 떠 있는 둥근 버튼. 아이폰 하단 안전 영역은 피한다(창·알림보다는 아래).
  // 768px 미만은 아래 메뉴 막대(관리자는 그 옆의 관리자 메뉴 버튼) 위에 뜬다.
  button: css`
    position: fixed;
    right: 16px;
    bottom: calc(env(safe-area-inset-bottom) + ${NAV_BAR_SPACE});
    z-index: 10;
    width: 44px;
    height: 44px;
    font-size: 20px;
    border-radius: 50%;
    box-shadow: var(--ui-shadow);

    @media (min-width: 768px) {
      right: 24px;
      bottom: 24px;
    }
  `,
};
