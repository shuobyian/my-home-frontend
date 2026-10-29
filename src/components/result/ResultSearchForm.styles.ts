import { breakpoints } from "@/ui";
import { css } from "@emotion/react";

export const styles = {
  search: css`
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(min(100%, var(--ui-filter-min-width)), 1fr)
    );
    gap: var(--ui-space-4);
    align-items: end;

    @media (min-width: ${breakpoints.tablet}) {
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
    }
  `,
  name: css`
    grid-column: 1 / -1;
    min-width: 0;

    @media (min-width: ${breakpoints.tablet}) {
      grid-column: auto;
    }
  `,
};
