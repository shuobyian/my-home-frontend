import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { styles } from "./Pager.styles";
import { Select } from "./Select";

// 쪽이 7개를 넘으면 1 … 현재±2 … 마지막으로 줄인다
function pageItems(page: number, count: number) {
  const from = count > 7 ? Math.max(2, page - 2) : 2;
  const to = count > 7 ? Math.min(count - 1, page + 2) : count - 1;
  const items: (number | "startGap" | "endGap")[] = [1];
  if (from > 2) items.push("startGap");
  for (let item = from; item <= to; item++) items.push(item);
  if (to < count - 1) items.push("endGap");
  if (count > 1) items.push(count);
  return items;
}

interface PagerProps {
  // 1부터
  page: number;
  pageCount: number;
  pageSize: number;
  // 있으면 쪽당 개수를 이 중에서 고르게 한다
  pageSizes?: readonly number[];
  onChange: (page: number, pageSize: number) => void;
}

// 쪽 이동(표·카드 목록 아래에 놓는다)
export function Pager({
  page,
  pageCount,
  pageSize,
  pageSizes,
  onChange,
}: PagerProps) {
  return (
    <nav aria-label='페이지 이동' css={styles.pager}>
      <button
        type='button'
        css={styles.pageButton}
        aria-label='이전 페이지'
        disabled={page <= 1}
        onClick={() => onChange(page - 1, pageSize)}
      >
        <ChevronLeftIcon />
      </button>
      {pageItems(page, pageCount).map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type='button'
            css={styles.pageButton}
            aria-label={`${item} 페이지`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item, pageSize)}
          >
            {item}
          </button>
        ) : (
          <span key={item} css={styles.pageGap} aria-hidden='true'>
            …
          </span>
        )
      )}
      <button
        type='button'
        css={styles.pageButton}
        aria-label='다음 페이지'
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1, pageSize)}
      >
        <ChevronRightIcon />
      </button>
      {pageSizes && (
        <Select
          css={styles.sizeSelect}
          aria-label='페이지당 개수'
          value={String(pageSize)}
          onChange={(value) => onChange(page, Number(value))}
          options={pageSizes.map((size) => ({
            value: String(size),
            label: `${size}개씩`,
          }))}
        />
      )}
    </nav>
  );
}
