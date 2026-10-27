import { css } from "@emotion/react";
import { ADMIN_NAV_SPACE, NAV_BAR_SPACE } from "./AppNav.styles";

export const styles = {
  // 768px 이상은 메뉴(위 가운데에 떠 있는 막대) 아래에 본문이 온다. 미만은 메뉴가 화면 아래에 떠 있다.
  // 화면 높이를 채워 화면(로그인 등)이 남은 높이 안에서 가운데 정렬할 수 있게 한다(dvh를 모르는 브라우저는 vh)
  layout: css`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
  `,

  // 본문 영역. 768px 미만은 아래 메뉴 막대와 아이폰 하단 안전 영역에 가리지 않도록 아래 여백을 둔다.
  // 768px 이상은 좌우 여백을 넓히고, 1280px 이상은 더 넓힌다.
  content: css`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    padding: 10px 10px calc(env(safe-area-inset-bottom) + ${NAV_BAR_SPACE});

    @media (min-width: 768px) {
      padding: 10px 24px;
    }

    @media (min-width: 1280px) {
      padding: 10px 64px;
    }
  `,

  // 768px 이상에서 관리자는 오른쪽에 떠 있는 관리자 메뉴 막대에 본문(입력칸·버튼)이 가리지 않게 한다.
  // 768px 미만은 관리자 메뉴가 오른쪽 아래 버튼으로 접혀 비워 두지 않는다.
  // content의 1280px 규칙보다 뒤에 놓여야 덮이지 않는다(AppLayout이 content 다음에 준다).
  adminSpace: css`
    @media (min-width: 768px) {
      padding-right: ${ADMIN_NAV_SPACE};
    }
  `,
};
