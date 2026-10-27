import { MaterialCost } from "@/types/result";
import { OwnedCounts, shortage, shortagePrice } from "@/domain/inventory";
import { mungRemainder, toMung } from "@/domain/result";
import { formatNumber } from "@/lib/format";
import { ShortageText } from "@/components/common/ShortageText";
import { Table, TableColumn } from "@/ui";

const countText = (count: number) => `${formatNumber(count)}개`;

// 1뭉이 안 되면 '-'. 낱개가 남으면 그 개수를 소수 두 자리로 붙인다(1뭉 46개 → 1.46뭉).
// 낱개는 99개 미만이라 두 자리면 되고, 소수 개수의 낱개는 버린다
const mungText = (count: number) => {
  if (toMung(count) === 0) return "-";
  const mung = formatNumber(toMung(count));
  const rest = Math.floor(mungRemainder(count));
  return rest > 0 ? `${mung}.${String(rest).padStart(2, "0")}뭉` : `${mung}뭉`;
};

const goldText = (price: number) => `${formatNumber(price)}골드`;

// 한글은 글자 사이 어디서나 줄이 바뀌어, 칸이 좁으면 '99개'가 '99 / 개'로 갈린다.
// 값은 한 줄로 두고, 모자라면 표가 가로로 스크롤된다
const noWrap = (text: string) => (
  <span style={{ whiteSpace: "nowrap" }}>{text}</span>
);

// 원래 값 왼쪽에 작은 회색 글씨로 '(N 부족)'을 붙인다(오른쪽 정렬된 원래 값이 줄을 맞추도록).
// 칸이 좁으면 둘 사이에서만 줄을 바꾼다. 부족하지 않으면 원래 값만
function withShortage(value: string, lacking: string | null) {
  if (!lacking) return noWrap(value);
  return (
    <>
      <ShortageText>{lacking}</ShortageText> {noWrap(value)}
    </>
  );
}

// 보유 재료가 있으면(로그인) 보유 열을 더하고, 개수·뭉·골드 옆에 부족(개수 - 보유)한 만큼을 붙인다
function materialColumns(owned?: OwnedCounts): TableColumn<MaterialCost>[] {
  const ownedOf = (name: string) => owned?.get(name) ?? 0;
  // 보유 재료를 모르면(로그아웃) 부족도 보여 주지 않는다
  const shortageOf = ({ name, count }: MaterialCost) =>
    owned ? shortage(count, ownedOf(name)) : 0;
  const shortagePriceOf = ({ name, count, price }: MaterialCost) =>
    owned ? shortagePrice(count, price, ownedOf(name)) : 0;

  const ownedColumn: TableColumn<MaterialCost> = {
    title: "보유",
    key: "owned",
    render: ({ name }) => noWrap(countText(ownedOf(name))),
    align: "right",
  };

  return [
    {
      title: "재료",
      key: "name",
      render: ({ name }) => noWrap(name),
    },
    {
      title: "개수",
      key: "count",
      render: (material) => {
        const lacking = shortageOf(material);
        return withShortage(
          countText(material.count),
          lacking > 0 ? countText(lacking) : null
        );
      },
      align: "right",
      sorter: (a, b) => a.count - b.count,
    },
    ...(owned ? [ownedColumn] : []),
    {
      title: "뭉",
      key: "mung",
      render: (material) => {
        const lacking = shortageOf(material);
        return withShortage(
          mungText(material.count),
          toMung(lacking) > 0 ? mungText(lacking) : null
        );
      },
      align: "right",
    },
    {
      title: "골드",
      key: "price",
      render: (material) => {
        const lacking = shortagePriceOf(material);
        return withShortage(
          goldText(material.price),
          lacking > 0 ? goldText(lacking) : null
        );
      },
      align: "right",
      sorter: (a, b) => a.price - b.price,
    },
  ];
}

interface MaterialTableProps {
  materials: MaterialCost[];
  // 로그인한 회원의 보유 재료. 있으면 보유 열과, 개수·뭉·골드 옆에 부족(개수 - 보유)한 만큼을 함께 보여 준다
  owned?: OwnedCounts;
}

export function MaterialTable({ materials, owned }: MaterialTableProps) {
  return (
    <Table
      size='small'
      columns={materialColumns(owned)}
      data={materials}
      rowKey={(material) => material.name}
      pagination={{ showSizeChanger: true }}
    />
  );
}
