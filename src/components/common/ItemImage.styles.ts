import { css } from "@emotion/react";

export const styles = {
  // 목록용 원형 이미지
  avatar: css`
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: var(--ui-avatar-size);
    height: var(--ui-avatar-size);
    overflow: hidden;
    font-size: var(--ui-icon-size-lg);
    color: var(--ui-color-text-inverse);
    vertical-align: middle;
    border-radius: var(--ui-radius-full);

    & img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,

  // 카드 위쪽을 꽉 채우는 사진. 세로는 가로의 2/3이고, 넘치는 아래쪽은 잘린다.
  // 사진은 제작 화면 캡처라 위쪽에 물품·재료가, 아래쪽에 수량 막대·만들기 버튼이 있어 위를 기준으로 자른다.
  // overflow를 숨겨야 사진 원래 높이에 칸이 늘어나지 않는다. 모서리는 카드가 잘라 준다
  cover: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 3 / 2;
    overflow: hidden;
    font-size: var(--ui-cover-icon-size);
    color: var(--ui-color-text-inverse);

    & img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
    }
  `,

  // 사진을 불러오지 못했을 때. avatar·cover 뒤에 둔다
  fallback: css`
    color: var(--ui-color-primary);
    background: var(--ui-color-primary-bg);
  `,

  // 좁은 화면에서는 칸 폭에 맞춰 줄어든다
  detail: css`
    max-width: 100%;
    height: auto;
    vertical-align: middle;
    border-radius: var(--ui-radius-lg);
  `,
};
