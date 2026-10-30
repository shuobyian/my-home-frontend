import { CHANGE_TARGET_LABEL } from "@/domain/labels";
import { findChangeField, formatChangeValue } from "@/domain/report";
import { ReportChange } from "@/types/report";
import { Table, TableColumn, Text } from "@/ui";

const columns: TableColumn<ReportChange>[] = [
  {
    key: "target",
    title: "종류",
    render: ({ target }) => CHANGE_TARGET_LABEL[target],
  },
  { key: "label", title: "대상", render: ({ label }) => label },
  {
    key: "field",
    title: "항목",
    render: ({ target, field }) =>
      findChangeField(target, field)?.label ?? field,
  },
  {
    key: "before",
    // 데이터가 나중에 바뀌어도 쓸 때의 값을 보여 준다
    title: "쓸 때 값",
    align: "right",
    render: ({ target, field, before }) =>
      formatChangeValue(target, field, before),
  },
  {
    key: "after",
    title: "바른 값",
    align: "right",
    render: ({ target, field, after }) => (
      <Text strong>{formatChangeValue(target, field, after)}</Text>
    ),
  },
];

// 제보에 담긴 바꿀 값 목록
export function ReportChangeTable({
  changes,
}: {
  changes: readonly ReportChange[];
}) {
  return (
    <Table
      size='small'
      columns={columns}
      data={changes}
      rowKey={({ target, targetId, field }) => `${target}-${targetId}-${field}`}
      pagination={false}
    />
  );
}
