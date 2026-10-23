import { getToolLabel } from "@/domain/labels";
import { Result } from "@/types/result";
import { ResultDetail } from "@/components/result/ResultDetail";
import { Table, TableColumn } from "@/ui";

const columns: TableColumn<Result>[] = [
  {
    title: "물품명",
    key: "name",
    // 잘린 이름은 표가 title 속성으로 전체를 보여 준다
    render: ({ name }) => name,
    ellipsis: true,
  },
  {
    title: "제작 도구",
    key: "tool",
    align: "right",
    render: ({ tool }) => getToolLabel(tool),
    width: 100,
  },
  {
    title: "레벨",
    key: "level",
    align: "right",
    render: ({ level }) => level,
    width: 80,
  },
];

interface ResultTableProps {
  loading: boolean;
  pagination?: {
    page: number;
    size: number;
    total: number;
    onChange: (page: number) => void;
  };
  contents: Result[];
  // 행을 누르면 호출된다(예: 장바구니에 담기)
  onRowClick?: (result: Result) => void;
}

export function ResultTable({
  loading,
  pagination,
  contents,
  onRowClick,
}: ResultTableProps) {
  return (
    <Table
      loading={loading}
      columns={columns}
      data={contents}
      rowKey={(content) => content.id}
      pagination={
        pagination && {
          page: pagination.page + 1,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: pagination.onChange,
        }
      }
      expandedRowRender={(record) => <ResultDetail result={record} />}
      onRowClick={onRowClick}
    />
  );
}
