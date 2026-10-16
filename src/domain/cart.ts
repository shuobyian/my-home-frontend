import { isResult } from "domain/result";
import { MaterialCost, Result } from "types/result";

// 장바구니에 담은 결과의 출처. 같은 id라도 출처가 다르면 다른 시세로 계산된 결과다.
export type CartSource = "server" | "free" | "walnut";

export const CART_SOURCE_LABEL: Record<CartSource, string> = {
  server: "기본 시세",
  free: "자유 모드",
  walnut: "호두작",
};

// 장바구니 항목: 담은 시점의 결과 스냅샷(가격 포함)과 수량
export interface CartEntry {
  key: string;
  source: CartSource;
  item: Result;
  count: number;
}

// 항목 키(`출처:결과 id`) → 장바구니 항목
export type Cart = Record<string, CartEntry>;

export type CartAction =
  | { type: "add"; source: CartSource; item: Result }
  | { type: "increment"; key: string }
  | { type: "decrement"; key: string }
  | { type: "setCount"; key: string; count: number }
  | { type: "remove"; key: string }
  | { type: "clear" };

export function cartKey(source: CartSource, id: number) {
  return `${source}:${id}`;
}

function withoutKey(cart: Cart, key: string): Cart {
  const next = { ...cart };
  delete next[key];
  return next;
}

// 상태를 직접 바꾸지 않고 항상 새 객체를 반환한다
export function cartReducer(cart: Cart, action: CartAction): Cart {
  if (action.type === "clear") return {};

  if (action.type === "add") {
    const key = cartKey(action.source, action.item.id);
    const prev = cart[key];
    // 이미 담긴 결과는 처음 담은 스냅샷을 유지하고 수량만 늘린다
    return {
      ...cart,
      [key]: prev
        ? { ...prev, count: prev.count + 1 }
        : { key, source: action.source, item: action.item, count: 1 },
    };
  }

  const entry = cart[action.key];
  if (!entry) return cart;

  switch (action.type) {
    case "increment":
      return { ...cart, [entry.key]: { ...entry, count: entry.count + 1 } };
    case "decrement":
      return entry.count <= 1
        ? withoutKey(cart, entry.key)
        : { ...cart, [entry.key]: { ...entry, count: entry.count - 1 } };
    case "setCount":
      // 1 이상의 정수만 받는다(음수·소수·0은 무시)
      if (!Number.isInteger(action.count) || action.count < 1) return cart;
      return { ...cart, [entry.key]: { ...entry, count: action.count } };
    case "remove":
      return withoutKey(cart, entry.key);
  }
}

export function totalCount(cart: Cart) {
  return Object.values(cart).reduce((acc, { count }) => acc + count, 0);
}

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

const SOURCES: CartSource[] = ["server", "free", "walnut"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

// 저장된 장바구니를 복원한다. 형태가 맞지 않는 항목은 버린다.
export function parseCart(value: unknown): Cart {
  if (!isRecord(value)) return {};

  const cart: Cart = {};
  Object.values(value).forEach((entry) => {
    if (
      isRecord(entry) &&
      SOURCES.includes(entry.source as CartSource) &&
      isResult(entry.item) &&
      isValidCount(entry.count)
    ) {
      const source = entry.source as CartSource;
      const key = cartKey(source, entry.item.id);
      cart[key] = { key, source, item: entry.item, count: entry.count };
    }
  });
  return cart;
}

// 이전 형식(결과 id → { item, count })을 변환한다.
// 출처 정보가 없으므로 기본 시세 결과로 간주한다.
export function migrateLegacyCart(value: unknown): Cart {
  if (!isRecord(value)) return {};

  return parseCart(
    Object.fromEntries(
      Object.entries(value).map(([id, entry]) => [
        id,
        isRecord(entry) ? { ...entry, source: "server" } : entry,
      ])
    )
  );
}
