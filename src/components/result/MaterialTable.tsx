import { MaterialCost } from "@/types/result";
import { OwnedCounts, shortage, shortagePrice } from "@/domain/inventory";
import { toMung } from "@/domain/result";
import { formatNumber } from "@/lib/format";
import { Table, TableColumn } from "@/ui";

// 1뭉이 안 되면 '-'
const mungText = (count: number) =>
  toMung(count) > 0 ? `${formatNumber(toMung(count))}뭉` : "-";

const nameColumn: TableColumn<MaterialCost> = {
  title: "재료",
  key: "name",
  render: ({ name }) => name,
};

const costColumns: TableColumn<MaterialCost>[] = [
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
    render: ({ count }) => mungText(count),
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

// 원래 개수·뭉·골드 뒤에 둘 보유 개수와 부족 개수·뭉·골드(로그인해서 보유 재료를 받았을 때만)
function ownedColumns(owned: OwnedCounts): TableColumn<MaterialCost>[] {
  const ownedOf = (name: string) => owned.get(name) ?? 0;
  const shortageOf = ({ name, count }: MaterialCost) =>
    shortage(count, ownedOf(name));
  const shortagePriceOf = ({ name, count, price }: MaterialCost) =>
    shortagePrice(count, price, ownedOf(name));
  return [
    {
      title: "보유",
      key: "owned",
      render: ({ name }) => `${formatNumber(ownedOf(name))}개`,
      align: "right",
    },
    {
      title: "부족 개수",
      key: "shortage",
      render: (material) => `${formatNumber(shortageOf(material))}개`,
      align: "right",
      sorter: (a, b) => shortageOf(a) - shortageOf(b),
    },
    {
      title: "부족 뭉",
      key: "shortageMung",
      render: (material) => mungText(shortageOf(material)),
      align: "right",
    },
    {
      title: "부족 골드",
      key: "shortagePrice",
      render: (material) => `${formatNumber(shortagePriceOf(material))}골드`,
      align: "right",
      sorter: (a, b) => shortagePriceOf(a) - shortagePriceOf(b),
    },
  ];
}

interface MaterialTableProps {
  materials: MaterialCost[];
  // 로그인한 회원의 보유 재료. 있으면 보유 개수와 부족(개수 - 보유)의 개수·뭉·골드 열을 함께 보여 준다
  owned?: OwnedCounts;
}

export function MaterialTable({ materials, owned }: MaterialTableProps) {
  const columns = [
    nameColumn,
    ...costColumns,
    ...(owned ? ownedColumns(owned) : []),
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
