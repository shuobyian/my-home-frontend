import { Table, TableColumnsType, Tooltip } from "antd";
import { getToolLabel } from "domain/labels";
import { Result } from "types/result";
import { ResultDetail } from "components/result/ResultDetail";

const columns: TableColumnsType<Result> = [
  {
    title: "물품명",
    dataIndex: "name",
    key: "name",
    render: (name) => <Tooltip title={name}>{name}</Tooltip>,
    ellipsis: true,
  },
  {
    title: "제작 도구",
    dataIndex: "tool",
    key: "tool",
    align: "right",
    render: (tool) => getToolLabel(tool),
    width: 100,
  },
  {
    title: "레벨",
    dataIndex: "level",
    key: "level",
    align: "right",
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
      dataSource={contents.map((content) => ({
        ...content,
        key: content.id,
      }))}
      pagination={
        pagination
          ? {
              current: pagination.page + 1,
              pageSize: pagination.size,
              total: pagination.total,
              onChange: pagination.onChange,
              showSizeChanger: false,
            }
          : undefined
      }
      expandable={{
        expandedRowRender: (record) => <ResultDetail result={record} />,
      }}
      onRow={(item) => ({
        onClick: () => onRowClick?.(item),
        style: onRowClick ? { cursor: "pointer" } : undefined,
      })}
    />
  );
}
