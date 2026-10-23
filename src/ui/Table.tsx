import {
  Fragment,
  Key,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useState,
} from "react";
import { Empty } from "./Feedback";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
} from "./icons";
import { Spin } from "./Spin";
import { styles } from "./Table.styles";

export interface TableColumn<T> {
  key: string;
  title: ReactNode;
  render: (record: T, index: number) => ReactNode;
  width?: number;
  align?: "left" | "center" | "right";
  // 한 줄로 자르고, 글자·숫자 내용이면 title 속성으로 전체를 보여 준다
  ellipsis?: boolean;
  // 가로 스크롤 때 왼쪽에 고정한다
  fixed?: boolean;
  sorter?: (a: T, b: T) => number;
}

export interface TablePagination {
  // 1부터. 있으면 서버 페이지(data는 이미 그 쪽의 행)
  page?: number;
  pageSize?: number;
  // 서버 페이지의 전체 개수
  total?: number;
  onChange?: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
}

export interface TableSelection<T> {
  selected: readonly T[];
  onChange: (rows: T[]) => void;
  // 행 체크박스의 접근 이름에 쓴다
  label: (record: T) => string;
}

export interface TableProps<T> {
  columns: readonly TableColumn<T>[];
  data: readonly T[];
  rowKey: (record: T) => Key;
  loading?: boolean;
  size?: "small" | "medium";
  emptyText?: ReactNode;
  pagination?: false | TablePagination;
  selection?: TableSelection<T>;
  expandedRowRender?: (record: T) => ReactNode;
  onRowClick?: (record: T) => void;
}

type SortOrder = "ascending" | "descending";

const EXTRA_WIDTH = 48;
const PAGE_SIZES = [10, 20, 50, 100];
// 여기서 시작한 클릭은 행 클릭으로 치지 않는다(체크박스·펼침 버튼·셀 안 입력)
const INTERACTIVE = "button, input, select, textarea, a, label";

export function Table<T>({
  columns,
  data,
  rowKey,
  loading,
  size = "medium",
  emptyText,
  pagination,
  selection,
  expandedRowRender,
  onRowClick,
}: TableProps<T>) {
  const options: TablePagination = pagination || {};
  const [sort, setSort] = useState<{ key: string; order: SortOrder } | null>(
    null
  );
  const [expanded, setExpanded] = useState<ReadonlySet<Key>>(() => new Set());
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(options.pageSize ?? 10);

  const server = options.page !== undefined;
  // 크기 선택이 사라지면(data가 줄어서 등) 고른 개수 대신 기본 개수로 나눈다. 고칠 수단이 없는 개수를 남기지 않는다
  const pageSize =
    server || !options.showSizeChanger
      ? (options.pageSize ?? 10)
      : clientPageSize;
  const total = server ? (options.total ?? data.length) : data.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  // data가 줄어 보던 쪽이 사라지면 마지막 쪽으로 고정한다
  if (!server && clientPage > pageCount) setClientPage(pageCount);
  const page = options.page ?? Math.min(clientPage, pageCount);

  const sorter = columns.find((column) => column.key === sort?.key)?.sorter;
  const direction = sort?.order === "descending" ? -1 : 1;
  const sorted = sorter
    ? [...data].sort((a, b) => sorter(a, b) * direction)
    : data;
  const rows =
    pagination !== false && !server
      ? sorted.slice((page - 1) * pageSize, page * pageSize)
      : sorted;

  const changePage = (requested: number, nextSize: number) => {
    // 쪽당 개수가 늘어 보던 쪽이 사라지면 마지막 쪽으로 맞춘다
    const nextPage = Math.min(requested, Math.ceil(total / nextSize) || 1);
    if (nextPage === page && nextSize === pageSize) return;
    setClientPage(nextPage);
    setClientPageSize(nextSize);
    options.onChange?.(nextPage, nextSize);
  };

  const toggleSort = (key: string) => {
    setSort(
      sort?.key !== key
        ? { key, order: "ascending" }
        : sort.order === "ascending"
          ? { key, order: "descending" }
          : null
    );
    if (!server) changePage(1, pageSize);
  };

  const toggleExpanded = (key: Key) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  const selectedKeys = new Set(selection?.selected.map(rowKey));
  const pageKeys = new Set(rows.map(rowKey));
  const pageSelected = rows.filter((record) =>
    selectedKeys.has(rowKey(record))
  ).length;
  const allSelected = rows.length > 0 && pageSelected === rows.length;

  // 다른 쪽에서 고른 행은 그대로 두고 현재 쪽 행만 넣고 뺀다
  const togglePage = (current: TableSelection<T>) =>
    current.onChange(
      allSelected
        ? current.selected.filter((record) => !pageKeys.has(rowKey(record)))
        : [
            ...current.selected,
            ...rows.filter((record) => !selectedKeys.has(rowKey(record))),
          ]
    );

  const toggleRow = (current: TableSelection<T>, record: T, key: Key) =>
    current.onChange(
      selectedKeys.has(key)
        ? current.selected.filter((row) => rowKey(row) !== key)
        : [...current.selected, record]
    );

  const handleRowClick = (event: MouseEvent<HTMLElement>, record: T) => {
    const origin = (event.target as Element).closest(INTERACTIVE);
    if (origin && event.currentTarget.contains(origin)) return;
    onRowClick?.(record);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLElement>, record: T) => {
    if (event.key === "Enter" && event.target === event.currentTarget) {
      onRowClick?.(record);
    }
  };

  const extras = (selection ? 1 : 0) + (expandedRowRender ? 1 : 0);
  const colSpan = columns.length + extras;
  const minWidth = columns.every((column) => column.width !== undefined)
    ? columns.reduce(
        (sum, column) => sum + (column.width ?? 0),
        extras * EXTRA_WIDTH
      )
    : undefined;

  // 고정 열이 있으면 선택·펼침 열도 함께 고정한다
  const hasFixed = columns.some((column) => column.fixed);
  const extraCell = (left: number) => ({
    css: [styles.extra, hasFixed && styles.fixed],
    style: hasFixed ? { left } : undefined,
  });
  const selectCell = extraCell(0);
  const expandCell = extraCell(selection ? EXTRA_WIDTH : 0);
  const lefts: (number | undefined)[] = [];
  let offset = extras * EXTRA_WIDTH;
  for (const column of columns) {
    lefts.push(column.fixed ? offset : undefined);
    if (column.fixed) offset += column.width ?? 0;
  }
  const cell = (column: TableColumn<T>, index: number) => ({
    css: [
      column.ellipsis && styles.ellipsis,
      lefts[index] !== undefined && styles.fixed,
    ],
    style: { textAlign: column.align, left: lefts[index] },
  });

  return (
    <Spin spinning={!!loading}>
      <div css={styles.scroll}>
        <table
          css={[
            styles.table,
            size === "small" && styles.small,
            columns.some((column) => column.ellipsis) && styles.fixedLayout,
          ]}
          style={{ minWidth }}
        >
          <colgroup>
            {selection && <col style={{ width: EXTRA_WIDTH }} />}
            {expandedRowRender && <col style={{ width: EXTRA_WIDTH }} />}
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {selection && (
                <th scope='col' {...selectCell}>
                  <input
                    type='checkbox'
                    css={styles.checkbox}
                    aria-label='현재 페이지 전체 선택'
                    checked={allSelected}
                    disabled={rows.length === 0}
                    ref={(element) => {
                      if (element) {
                        element.indeterminate =
                          pageSelected > 0 && !allSelected;
                      }
                    }}
                    onChange={() => togglePage(selection)}
                  />
                </th>
              )}
              {expandedRowRender && (
                <th scope='col' {...expandCell}>
                  <span className='ui-sr-only'>펼침</span>
                </th>
              )}
              {columns.map((column, index) => {
                const order = sort?.key === column.key ? sort.order : undefined;
                return (
                  <th
                    key={column.key}
                    scope='col'
                    aria-sort={order}
                    {...cell(column, index)}
                  >
                    {column.sorter ? (
                      <button
                        type='button'
                        css={styles.sorter}
                        onClick={() => toggleSort(column.key)}
                      >
                        {column.title}
                        <span css={styles.sortIcon} aria-hidden='true'>
                          <span
                            css={order === "ascending" && styles.sortActive}
                          >
                            ▲
                          </span>
                          <span
                            css={order === "descending" && styles.sortActive}
                          >
                            ▼
                          </span>
                        </span>
                      </button>
                    ) : (
                      column.title
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                {/* 불러오는 동안에는 '데이터 없음'을 숨기고 회전 표시가 놓일 자리만 남긴다 */}
                <td
                  colSpan={colSpan}
                  style={loading ? { visibility: "hidden" } : undefined}
                >
                  <Empty description={emptyText} />
                </td>
              </tr>
            ) : (
              rows.map((record, rowIndex) => {
                const key = rowKey(record);
                const isExpanded = expanded.has(key);
                return (
                  <Fragment key={key}>
                    <tr
                      css={[
                        styles.row,
                        selectedKeys.has(key) && styles.selected,
                        onRowClick && styles.clickable,
                      ]}
                      tabIndex={onRowClick ? 0 : undefined}
                      onClick={
                        onRowClick && ((event) => handleRowClick(event, record))
                      }
                      onKeyDown={
                        onRowClick &&
                        ((event) => handleRowKeyDown(event, record))
                      }
                    >
                      {selection && (
                        <td {...selectCell}>
                          <input
                            type='checkbox'
                            css={styles.checkbox}
                            aria-label={`${selection.label(record)} 선택`}
                            checked={selectedKeys.has(key)}
                            onChange={() => toggleRow(selection, record, key)}
                          />
                        </td>
                      )}
                      {expandedRowRender && (
                        <td {...expandCell}>
                          <button
                            type='button'
                            css={styles.expandButton}
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? "행 접기" : "행 펼치기"}
                            onClick={() => toggleExpanded(key)}
                          >
                            {isExpanded ? <MinusIcon /> : <PlusIcon />}
                          </button>
                        </td>
                      )}
                      {columns.map((column, index) => {
                        const content = column.render(record, rowIndex);
                        return (
                          <td
                            key={column.key}
                            {...cell(column, index)}
                            title={
                              column.ellipsis &&
                              (typeof content === "string" ||
                                typeof content === "number")
                                ? String(content)
                                : undefined
                            }
                          >
                            {content}
                          </td>
                        );
                      })}
                    </tr>
                    {isExpanded && expandedRowRender && (
                      <tr css={styles.expandedRow}>
                        <td colSpan={colSpan}>{expandedRowRender(record)}</td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination !== false &&
        total > (options.showSizeChanger ? PAGE_SIZES[0] : pageSize) && (
          <Pager
            page={page}
            pageCount={pageCount}
            pageSize={pageSize}
            showSizeChanger={options.showSizeChanger}
            onChange={changePage}
          />
        )}
    </Spin>
  );
}

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
  page: number;
  pageCount: number;
  pageSize: number;
  showSizeChanger?: boolean;
  onChange: (page: number, pageSize: number) => void;
}

function Pager({
  page,
  pageCount,
  pageSize,
  showSizeChanger,
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
      {showSizeChanger && (
        <select
          css={styles.sizeSelect}
          aria-label='페이지당 개수'
          value={pageSize}
          onChange={(event) => onChange(page, Number(event.target.value))}
        >
          {PAGE_SIZES.map((option) => (
            <option key={option} value={option}>
              {option}개씩
            </option>
          ))}
        </select>
      )}
    </nav>
  );
}
