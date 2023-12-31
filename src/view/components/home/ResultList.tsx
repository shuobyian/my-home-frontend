import { Tooltip } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { Result } from "apis/result/getResults";
import { getToolLabel } from "apis/type/Tool";
import { ResultDetail } from "view/components/home/ResultDetail";

const columns: ColumnsType<Result> = [
  {
    title: "",
    dataIndex: "select",
    key: "select",
    width: 30,
  },
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

interface IResultListProps {
  loading: boolean;
  pagination?: {
    page: number;
    size: number;
    total: number;
    onChange: (page: number) => void;
  };
  contents: Result[];
}

export function ResultList({
  loading,
  pagination,
  contents,
}: IResultListProps) {
  return (
    <Table
      loading={loading}
      columns={columns}
      dataSource={contents.map((content) => ({ ...content, key: content.id }))}
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
        expandedRowRender: (record) => (
          <p style={{ margin: 0 }}>{<ResultDetail result={record} />}</p>
        ),
        rowExpandable: (record) => record.name !== "Not Expandable",
      }}
    />
  );
}
