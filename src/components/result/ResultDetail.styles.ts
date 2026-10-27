import { css } from "@emotion/react";

export const styles = {
  // 이름표·값 두 칸 목록. 이름표 폭은 가장 긴 이름표에 맞춘다
  info: css`
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: var(--ui-space-2) var(--ui-space-4);
    margin: 0;

    & > dt {
      color: var(--ui-color-text-secondary);
    }

    & > dd {
      margin: 0;
    }
  `,

  // 필요 금액 내역(재료비 + 제작비)
  breakdown: css`
    font-size: var(--ui-font-size-sm);
    color: var(--ui-color-text-secondary);
  `,

  // 필요 재료 묶음. 위의 정보 목록과 선으로 나눈다
  section: css`
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-2);
    padding-top: var(--ui-space-4);
    border-top: 1px solid var(--ui-color-border);
  `,

  // 필요 재료 태그
  materials: css`
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-space-1);
  `,

  material: css`
    padding: 0 var(--ui-space-2);
    font-size: var(--ui-font-size-sm);
    line-height: 22px;
    color: var(--ui-color-primary);
    background: var(--ui-color-primary-bg);
    border-radius: var(--ui-radius-sm);
  `,
};
