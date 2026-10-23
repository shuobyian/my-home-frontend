import { MaterialCost } from "@/types/result";
import { toMung } from "@/domain/result";
import { formatNumber } from "@/lib/format";
import { Table, TableColumn } from "@/ui";

const columns: TableColumn<MaterialCost>[] = [
  {
    title: "재료",
    key: "name",
    render: ({ name }) => name,
  },
  {
    title: "개수",
    key: "count",
    render: ({ count }) => `${formatNumber(count)}개`,
    align: "right",
    sorter: (a, b) => a.count - b.count,
  },
  {
    title: "뭉",
    key: "mung",
    render: ({ count }) =>
      toMung(count) > 0 ? `${formatNumber(toMung(count))}뭉` : "-",
    align: "right",
  },
  {
    title: "골드",
    key: "price",
    render: ({ price }) => `${formatNumber(price)}골드`,
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
      data={materials}
      rowKey={(material) => material.name}
      pagination={{ showSizeChanger: true }}
    />
  );
}
