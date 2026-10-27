import { css } from "@emotion/react";

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
};
