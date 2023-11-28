import Table, { ColumnsType } from "antd/es/table";
import { Result } from "apis/getResults";
import { getToolLabel } from "apis/type/Tool";
import { ResultDetail } from "view/components/home/ResultDetail";

const columns: ColumnsType<Result> = [
  {
    title: "",
    dataIndex: "select",
    key: "select",
    width: 150,
  },
  {
    title: "물품명",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "제작 도구",
    dataIndex: "tool",
    key: "tool",
    align: "right",
    render: (tool) => getToolLabel(tool),
    width: 200,
  },
  {
    title: "레벨",
    dataIndex: "level",
    key: "level",
    align: "right",
    width: 150,
  },
];

interface IResultListProps {
  loading: boolean;
  pagination?: {
    page: number;
    pageSize: number;
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
      dataSource={contents}
      pagination={{ ...pagination, showSizeChanger: false }}
      expandable={{
        expandedRowRender: (record) => (
          <p style={{ margin: 0 }}>{<ResultDetail result={record} />}</p>
        ),
        rowExpandable: (record) => record.name !== "Not Expandable",
      }}
    />
  );
}
