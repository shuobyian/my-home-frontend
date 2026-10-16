import { Table, TableColumnsType } from "antd";
import { MaterialCost } from "types/result";
import { formatNumber } from "lib/format";

const columns: TableColumnsType<MaterialCost> = [
  {
    title: "재료",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "개수",
    dataIndex: "count",
    key: "count",
    render: (count) => `${formatNumber(count)}개`,
    align: "right",
    sorter: (a, b) => a.count - b.count,
  },
  {
    title: "뭉",
    dataIndex: "count",
    key: "count",
    render: (count) =>
      count >= 99 ? `${formatNumber(Math.floor(count / 99))}뭉` : "-",
    align: "right",
  },
  {
    title: "골드",
    dataIndex: "price",
    key: "price",
    render: (price) => `${formatNumber(price)}골드`,
    align: "right",
    sorter: (a, b) => a.price - b.price,
  },
];

interface MaterialTableProps {
  materials: MaterialCost[];
}

export function MaterialTable({ materials }: MaterialTableProps) {
  return (
    <Table
      size='small'
      columns={columns}
      dataSource={materials.map((b) => ({ ...b, key: b.name }))}
      pagination={{
        total: materials.length,
        showSizeChanger: true,
      }}
    />
  );
}
