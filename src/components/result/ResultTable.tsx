import { Badge, Button, Space, Table, TableColumnsType, Tooltip } from "antd";
import { getToolLabel } from "domain/labels";
import { useState } from "react";
import { Result } from "types/result";
import { useSelectedResults } from "state/useSelectedResults";
import { ResultDetail } from "components/result/ResultDetail";
import { CartDrawer } from "components/cart/CartDrawer";

const columns: TableColumnsType<Result> = [
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

interface ResultTableProps {
  loading: boolean;
  pagination?: {
    page: number;
    size: number;
    total: number;
    onChange: (page: number) => void;
  };
  contents: Result[];
}

export function ResultTable({
  loading,
  pagination,
  contents,
}: ResultTableProps) {
  const { totalCount, onChange, ...rest } = useSelectedResults();
  const [open, setOpen] = useState(false);

  return (
    <Space direction='vertical'>
      <div style={{ float: "right" }}>
        <Badge count={totalCount}>
          <Button onClick={() => setOpen(true)}>장바구니</Button>
        </Badge>
      </div>
      <CartDrawer
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
            <div>{<ResultDetail result={record} />}</div>
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
