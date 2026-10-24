import { InventoryItem } from "@/types/inventory";
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
