import { InventoryItem } from "@/types/inventory";
import { Market } from "@/types/market";
import { MaterialCost } from "@/types/result";

// 재료 이름 → 보유 개수. 결과의 기초 재료는 시세 이름으로 오므로 이름으로 찾는다.
export type OwnedCounts = ReadonlyMap<string, number>;

export function toOwnedCounts(items: readonly InventoryItem[]): OwnedCounts {
  return new Map(items.map(({ name, count }) => [name, count]));
}

// 필요한 개수에서 가진 개수를 뺀 부족 개수. 넉넉하면 0
export function shortage(count: number, owned: number) {
  return Math.max(0, count - owned);
}

// 부족 개수만큼의 가격. 가격은 시세 × 개수이므로 개수로 나눠 시세를 되돌린다
export function shortagePrice(count: number, price: number, owned: number) {
  if (count <= 0) return 0;
  return (price * shortage(count, owned)) / count;
}

// 붙여 넣은 글에서 읽은 보유 개수(시세 id → 개수)와 읽지 못한 줄
export interface ParsedInventoryText {
  counts: Map<number, number>;
  skipped: string[];
}

// 한 줄: 재료명, 구분(공백·탭·쉼표·콜론), 개수(천 단위 쉼표, 끝의 '개'는 있어도 된다).
// 재료명에 공백이 있어도 되도록 이름은 가장 짧게 잡고 남은 끝을 개수로 읽는다
const LINE = /^(.+?)[\s,:=]+(\d[\d,]*)\s*개?$/;

// 한 줄에 재료 하나씩 적은 글(엑셀의 두 칸을 복사한 글 포함)을 시세 id별 개수로 읽는다.
// 빈 줄은 건너뛰고, 형식이 틀리거나 시세에 없는 재료의 줄은 skipped로 돌려준다.
// 같은 재료가 여러 번 나오면 마지막 줄을 쓴다
export function parseInventoryText(
  text: string,
  markets: readonly Market[]
): ParsedInventoryText {
  const idByName = new Map(markets.map(({ id, name }) => [name, id]));
  const counts = new Map<number, number>();
  const skipped: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const match = LINE.exec(line);
    const id = match ? idByName.get(match[1].trim()) : undefined;
    if (!match || id === undefined) {
      skipped.push(line);
      continue;
    }
    counts.set(id, Number(match[2].replaceAll(",", "")));
  }
  return { counts, skipped };
}

// 재료 목록에서 부족한 만큼의 총 가격
export function sumShortagePrice(
  materials: readonly MaterialCost[],
  owned: OwnedCounts
) {
  return materials.reduce(
    (acc, { name, count, price }) =>
      acc + shortagePrice(count, price, owned.get(name) ?? 0),
    0
  );
}
