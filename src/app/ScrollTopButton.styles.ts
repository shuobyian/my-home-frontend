import { css } from "@emotion/react";
import { breakpoints } from "@/ui";
import { NAV_BAR_SPACE } from "./AppNav.styles";

export const styles = {
  // 오른쪽 아래에 떠 있는 둥근 버튼. 아이폰 하단 안전 영역은 피한다(창·알림보다는 아래).
  // 768px 미만은 아래 메뉴 막대(관리자는 그 옆의 관리자 메뉴 버튼) 위에 뜬다.
  button: css`
    position: fixed;
    right: var(--ui-page-gutter);
    bottom: calc(env(safe-area-inset-bottom) + ${NAV_BAR_SPACE});
    z-index: var(--ui-z-nav);
    width: var(--ui-nav-item-size);
    height: var(--ui-nav-item-size);
    font-size: var(--ui-icon-size);
    border-radius: 50%;
    box-shadow: var(--ui-shadow-md);

    @media (min-width: ${breakpoints.tablet}) {
      right: var(--ui-space-5);
      bottom: var(--ui-space-5);
    }
  `,
};
