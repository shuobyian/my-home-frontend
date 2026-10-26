import { css } from "@emotion/react";

export const styles = {
  // −·입력칸·+ 한 줄. 열이 좁아지면 입력칸만 줄어든다
  stepper: css`
    display: flex;
    gap: var(--ui-space-1);

    & > button {
      flex-shrink: 0;
    }
  `,
};
