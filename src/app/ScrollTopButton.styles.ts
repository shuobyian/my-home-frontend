import { css } from "@emotion/react";
import { NAV_BAR_HEIGHT } from "./AppNav.styles";

export const styles = {
  // 오른쪽 아래에 떠 있는 둥근 버튼. 좁은 화면에서는 아래 탭 막대 위에 둔다(창·알림보다는 아래)
  button: css`
    position: fixed;
    right: 16px;
    bottom: calc(${NAV_BAR_HEIGHT} + env(safe-area-inset-bottom) + 16px);
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
