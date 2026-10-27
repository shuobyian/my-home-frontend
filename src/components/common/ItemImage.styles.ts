import { css } from "@emotion/react";

export const styles = {
  // 목록용 40px 원형
  avatar: css`
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    overflow: hidden;
    font-size: 24px;
    color: var(--ui-color-text-inverse);
    vertical-align: middle;
    border-radius: 50%;

    & img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,

  // 카드 위쪽을 꽉 채우는 정사각형. 모서리는 카드가 잘라 준다
  cover: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1;
    font-size: 64px;
    color: var(--ui-color-text-inverse);

    & img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,

  // 사진을 불러오지 못했을 때. avatar·cover 뒤에 둔다
  fallback: css`
    background: var(--ui-color-text-disabled);
  `,

  // 좁은 화면에서는 칸 폭에 맞춰 줄어든다
  detail: css`
    max-width: 100%;
    height: auto;
    vertical-align: middle;
    border-radius: var(--ui-radius-lg);
  `,
};
