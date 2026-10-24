import { MaterialCost } from "@/types/result";
import { OwnedCounts, shortage } from "@/domain/inventory";
import { toMung } from "@/domain/result";
import { formatNumber } from "@/lib/format";
import { Table, TableColumn } from "@/ui";

const nameColumn: TableColumn<MaterialCost> = {
  title: "재료",
  key: "name",
  render: ({ name }) => name,
};

const countColumn: TableColumn<MaterialCost> = {
  title: "개수",
  key: "count",
  render: ({ count }) => `${formatNumber(count)}개`,
  align: "right",
  sorter: (a, b) => a.count - b.count,
};

// 개수 옆에 둘 보유·부족 개수(로그인해서 보유 재료를 받았을 때만)
function ownedColumns(owned: OwnedCounts): TableColumn<MaterialCost>[] {
  const ownedOf = (name: string) => owned.get(name) ?? 0;
  const shortageOf = ({ name, count }: MaterialCost) =>
    shortage(count, ownedOf(name));
  return [
    {
      title: "보유",
      key: "owned",
      render: ({ name }) => `${formatNumber(ownedOf(name))}개`,
      align: "right",
    },
    {
      title: "부족",
      key: "shortage",
      render: (material) => `${formatNumber(shortageOf(material))}개`,
      align: "right",
      sorter: (a, b) => shortageOf(a) - shortageOf(b),
    },
  ];
}

const restColumns: TableColumn<MaterialCost>[] = [
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
  // 로그인한 회원의 보유 재료. 있으면 보유 개수와 부족 개수(개수 - 보유) 열을 함께 보여 준다
  owned?: OwnedCounts;
}

export function MaterialTable({ materials, owned }: MaterialTableProps) {
  const columns = [
    nameColumn,
    countColumn,
    ...(owned ? ownedColumns(owned) : []),
    ...restColumns,
  ];
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
