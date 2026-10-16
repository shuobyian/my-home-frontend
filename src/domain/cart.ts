import { MaterialCost, Result } from "types/result";

// 장바구니 항목: 담은 시점의 결과 스냅샷과 수량
export interface CartEntry {
  item: Result;
  count: number;
}

// 결과 id → 장바구니 항목 (localStorage에 이 모양 그대로 저장된다)
export type Cart = Record<number, CartEntry>;

// 담긴 결과들의 기초 재료를 이름별로 합산한다.
// 개수와 가격은 재료 값 × 담은 수량이고, 재료가 처음 나온 순서를 유지한다.
export function aggregateMaterials(cart: Cart): MaterialCost[] {
  const materials = new Map<string, MaterialCost>();

  Object.values(cart).forEach(({ item, count }) => {
    item.materials.forEach(({ name, count: unitCount, price }) => {
      const prev = materials.get(name);
      materials.set(name, {
        name,
        count: (prev?.count ?? 0) + unitCount * count,
        price: (prev?.price ?? 0) + price * count,
      });
    });
  });

  return Array.from(materials.values());
}

// 재료 목록의 총 가격
export function sumPrice(materials: MaterialCost[]) {
  return materials.reduce((acc, { price }) => acc + price, 0);
}
