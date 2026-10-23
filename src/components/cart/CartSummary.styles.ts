import { css } from "@emotion/react";

export const styles = {
  // 담긴 물품 접기 상자. 둥근 모서리 밖으로 제목 배경이 나오지 않게 자른다
  entries: css`
    overflow: hidden;
    border: 1px solid var(--ui-color-border);
    border-radius: var(--ui-radius-lg);
  `,

  // 상자가 바깥을 자르므로 포커스 외곽선을 안쪽에 그린다. 외곽선이 자르는 곡선을 따라가도록
  // 안쪽 반경(테두리 1px만큼 작게)을 준다. :focus-visible을 모르는 브라우저의 기본 외곽선에도
  // 적용되도록 :focus에 둔다(외곽선이 없으면 보이지 않는다).
  // 펼친 상자(details[open])에서는 아래 모서리를 목록과 맞닿게 편다. 위 규칙보다 뒤에 두고 특이도도 높다
  summary: css`
    padding: var(--ui-space-3) var(--ui-space-4);
    cursor: pointer;
    background: var(--ui-color-fill-alter);

    &:focus {
      outline-offset: -2px;
      border-radius: calc(var(--ui-radius-lg) - 1px);
    }

    details[open] > &:focus {
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
    }
  `,

  list: css`
    max-height: 300px;
    padding: 0 var(--ui-space-4);
    overflow: auto;
    border-top: 1px solid var(--ui-color-border);
  `,
};
