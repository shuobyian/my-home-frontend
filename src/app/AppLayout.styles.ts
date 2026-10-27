import { css } from "@emotion/react";
import { ADMIN_NAV_SPACE } from "./AppNav.styles";

export const styles = {
  // 메뉴(위 가운데에 떠 있는 막대) 아래에 본문이 온다.
  // 화면 높이를 채워 화면(로그인 등)이 남은 높이 안에서 가운데 정렬할 수 있게 한다(dvh를 모르는 브라우저는 vh)
  layout: css`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
  `,

  // 메뉴 아래의 본문 영역. 아이폰 하단 안전 영역만큼 아래 여백을 둔다.
  // 768px 이상은 좌우 여백을 넓히고, 1280px 이상은 더 넓힌다.
  content: css`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    padding: 10px 10px calc(env(safe-area-inset-bottom) + 10px);

    @media (min-width: 768px) {
      padding: 10px 24px;
    }

    @media (min-width: 1280px) {
      padding: 10px 64px;
    }
  `,

  // 관리자는 오른쪽에 떠 있는 관리자 메뉴에 본문(입력칸·버튼)이 가리지 않게 한다.
  // 좁은 화면에서도 비워 둔다. 겹치면 그 아래 칸을 누를 수 없다.
  // content의 화면 크기별 padding이 덮지 않도록 선택자를 두 번 써(&&) 우선순위를 높인다.
  adminSpace: css`
    && {
      padding-right: ${ADMIN_NAV_SPACE};
    }
  `,
};
