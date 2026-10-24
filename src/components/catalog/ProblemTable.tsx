import { PROBLEM_CODE_LABELS, SEVERITY_LABELS } from "@/domain/catalog";
import { ReactNode } from "react";
import { CatalogProblem, CatalogSeverity } from "@/types/catalog";
import { Stack, Table, TableColumn, Text } from "@/ui";

const SEVERITY_TONES: Record<
  CatalogSeverity,
  "danger" | "warning" | "secondary"
> = { error: "danger", warning: "warning", info: "secondary" };

interface ProblemRow {
  key: string;
  problem: CatalogProblem;
}

// 같은 문제가 두 번 오더라도(같은 재료 줄이 둘 등) 행 key가 겹치지 않게 순번을 붙인다
function toRows(problems: readonly CatalogProblem[]): ProblemRow[] {
  const seen = new Map<string, number>();
  return problems.map((problem) => {
    const { code, productId, material, marketId, related } = problem;
    const base = `${code}:${productId}:${material}:${marketId}:${related.join("/")}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return { key: count === 0 ? base : `${base}#${count}`, problem };
  });
}

const columns: TableColumn<ProblemRow>[] = [
  {
    title: "수준",
    key: "severity",
    width: 90,
    render: ({ problem: { severity } }) => (
      <Text tone={SEVERITY_TONES[severity]}>{SEVERITY_LABELS[severity]}</Text>
    ),
  },
  {
    title: "종류",
    key: "code",
    width: 130,
    render: ({ problem: { code } }) => PROBLEM_CODE_LABELS[code],
  },
  {
    title: "물품",
    key: "product",
    width: 140,
    render: ({ problem: { productName } }) => productName ?? "-",
  },
  {
    title: "재료·시세",
    key: "material",
    width: 120,
    render: ({ problem: { material } }) => material ?? "-",
  },
  {
    title: "설명",
    key: "message",
    width: 400,
    render: ({ problem: { message, hint } }) => (
      <Stack vertical gap={2}>
        <span>{message}</span>
        {hint && <Text tone='secondary'>{hint}</Text>}
      </Stack>
    ),
  },
];

interface ProblemTableProps {
  // 서버가 정한 순서(수준 → 종류 → 물품) 그대로 보여 준다
  problems: CatalogProblem[];
  // 있으면 문제마다 바로 고칠 수 있는 버튼을 조치 열에 둔다
  renderActions?: (problem: CatalogProblem) => ReactNode;
}

// 데이터 점검 문제 목록
export function ProblemTable({ problems, renderActions }: ProblemTableProps) {
  const tableColumns = renderActions
    ? [
        ...columns,
        {
          title: "조치",
          key: "actions",
          width: 220,
          render: ({ problem }: ProblemRow) => (
            <Stack wrap gap={4}>
              {renderActions(problem)}
            </Stack>
          ),
        },
      ]
    : columns;

  return (
    <Table
      rowKey={({ key }) => key}
      columns={tableColumns}
      data={toRows(problems)}
      // 50개를 넘으면 쪽당 개수를 고를 수 있게 한다
      pagination={{ showSizeChanger: problems.length > 50 }}
    />
  );
}
