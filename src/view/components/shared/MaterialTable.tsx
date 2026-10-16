import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { MaterialCost } from "types/result";
import { StringUtil } from "util/StringUtil";

const columns: ColumnsType<MaterialCost> = [
  {
    title: "재료",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "개수",
    dataIndex: "count",
    key: "count",
    render: (count) => `${StringUtil.numberWithCommas(count)}개`,
    align: "right",
    sorter: (a, b) => a.count - b.count,
  },
  {
    title: "뭉",
    dataIndex: "count",
    key: "count",
    render: (count) =>
      count >= 99
        ? `${StringUtil.numberWithCommas(Math.floor(count / 99))}뭉`
        : "-",
    align: "right",
  },
  {
    title: "골드",
    dataIndex: "price",
    key: "price",
    render: (price) => `${StringUtil.numberWithCommas(price)}골드`,
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
