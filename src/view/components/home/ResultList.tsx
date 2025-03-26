import { Badge, Button, Space, Tooltip } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { Result } from "apis/result/getResults";
import { getToolLabel } from "apis/type/Tool";
import { useState } from "react";
import { useSelectedResults } from "util/hook/useSelectedResults";
import { ResultDetail } from "view/components/home/ResultDetail";
import { SelectedResultDrawer } from "view/components/home/SelectedResultDrawer";

const columns: ColumnsType<Result> = [
  {
    title: "",
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
  const { totalCount, onChange, ...rest } = useSelectedResults();
  const [open, setOpen] = useState(false);

  return (
    <Space direction='vertical'>
      <div style={{ float: "right" }}>
        <Badge count={totalCount}>
          <Button onClick={() => setOpen(true)}>장바구니</Button>
        </Badge>
      </div>
      <SelectedResultDrawer
        open={open}
        onClose={() => setOpen(false)}
        totalCount={totalCount}
        {...rest}
      />
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
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>{<ResultDetail result={record} />}</p>
          ),
          rowExpandable: (record) => record.name !== "Not Expandable",
        }}
        onRow={(item) => ({
          onClick: () => {
            onChange(item);
          },
        })}
      />
    </Space>
  );
}
