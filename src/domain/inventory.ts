import { InventoryItem } from "@/types/inventory";

// 재료 이름 → 보유 개수. 결과의 기초 재료는 시세 이름으로 오므로 이름으로 찾는다.
export type OwnedCounts = ReadonlyMap<string, number>;

export function toOwnedCounts(items: readonly InventoryItem[]): OwnedCounts {
  return new Map(items.map(({ name, count }) => [name, count]));
}

// 필요한 개수에서 가진 개수를 뺀 부족 개수. 넉넉하면 0
export function shortage(count: number, owned: number) {
  return Math.max(0, count - owned);
}
