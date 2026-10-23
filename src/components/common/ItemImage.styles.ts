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

  // 사진을 불러오지 못했을 때. avatar 뒤에 둔다
  fallback: css`
    background: var(--ui-color-text-disabled);
  `,

  detail: css`
    height: auto;
    vertical-align: middle;
  `,
};
