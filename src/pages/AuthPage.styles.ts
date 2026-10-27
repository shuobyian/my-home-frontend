import { css } from "@emotion/react";

export const styles = {
  // 헤더 아래 남은 높이를 채우고 로그인 상자를 가운데 둔다.
  // 위의 메뉴·제목이 아래 footer(제작자)보다 높은 만큼 아래 여백을 줘서, 헤더 아래 영역이 아닌 화면 전체의 가운데 가까이 오게 한다.
  // 화면이 상자보다 낮으면 상자 높이만큼 늘어나 스크롤된다.
  // 입력·버튼은 다른 화면보다 크게 그린다.
  screen: css`
    --ui-control-height: 40px;

    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    padding-bottom: 64px;
  `,
};
