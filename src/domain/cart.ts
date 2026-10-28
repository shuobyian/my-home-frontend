import { isResult } from "@/domain/result";
import { MaterialCost, Result } from "@/types/result";

// 장바구니에 담은 결과의 출처. 같은 id라도 출처가 다르면 다른 시세로 계산된 결과다.
export type CartSource = "server" | "free" | "walnut";

export const CART_SOURCE_LABEL: Record<CartSource, string> = {
  server: "기본 시세",
  free: "시세 조작 모드",
  walnut: "호두작",
};

// 장바구니 구분. 기본 시세·호두작 결과는 홈 장바구니, 시세 조작 모드 결과는 시세 조작 모드 장바구니에 담는다.
// 입력한 시세로 계산한 결과가 기본 시세 합산에 섞이지 않도록 따로 보여 주고 따로 합산한다.
export type CartScope = "home" | "free";

export function cartScope(source: CartSource): CartScope {
  return source === "free" ? "free" : "home";
}

// 장바구니 항목: 담은 시점의 결과 스냅샷(가격 포함)과 수량
export interface CartEntry {
  key: string;
  source: CartSource;
  item: Result;
  count: number;
}

// 항목 키(`출처:결과 id`, 호두작·시세 조작 모드는 `출처:결과 id:스냅샷`) → 장바구니 항목
export type Cart = Record<string, CartEntry>;

export type CartAction =
  | { type: "add"; source: CartSource; item: Result }
  | { type: "increment"; key: string }
  | { type: "decrement"; key: string }
  | { type: "setCount"; key: string; count: number }
  | { type: "remove"; key: string }
  // scope가 있으면 그 구분에 담긴 항목만 비운다
  | { type: "clear"; scope?: CartScope };

// 계산할 때마다 시세나 수량이 달라지는 출처. 같은 결과 id라도 스냅샷이 다르면 따로 담는다.
// (호두작 결과는 필요한 앰플 개수만큼 곱해진 값이고, 시세 조작 모드는 입력한 시세로 계산된 값이다)
const SNAPSHOT_KEYED_SOURCES: CartSource[] = ["free", "walnut"];

// 재료 구성·가격으로 만든 짧은 해시(djb2)
function snapshotFingerprint(item: Result) {
  const text = item.materials
    .map(({ name, count, price }) => `${name}:${count}:${price}`)
    .join("|");
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

export function cartKey(source: CartSource, item: Result) {
  return SNAPSHOT_KEYED_SOURCES.includes(source)
    ? `${source}:${item.id}:${snapshotFingerprint(item)}`
    : `${source}:${item.id}`;
}

function withoutKey(cart: Cart, key: string): Cart {
  const next = { ...cart };
  delete next[key];
  return next;
}

function filterCart(cart: Cart, keep: (entry: CartEntry) => boolean): Cart {
  return Object.fromEntries(
    Object.entries(cart).filter(([, entry]) => keep(entry))
  );
}

// 한 구분(홈·시세 조작 모드)에 담긴 항목만 남긴다
export function cartOfScope(cart: Cart, scope: CartScope): Cart {
  return filterCart(cart, ({ source }) => cartScope(source) === scope);
}

// 상태를 직접 바꾸지 않고 항상 새 객체를 반환한다
export function cartReducer(cart: Cart, action: CartAction): Cart {
  if (action.type === "clear") {
    const { scope } = action;
    return scope
      ? filterCart(cart, ({ source }) => cartScope(source) !== scope)
      : {};
  }

  if (action.type === "add") {
    const key = cartKey(action.source, action.item);
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
      const key = cartKey(source, entry.item);
      cart[key] = { key, source, item: entry.item, count: entry.count };
    }
  });
  return cart;
}

// 이전 앱은 수량 입력에 제한이 없었고, 이전 서버는 재료 가격을 null로 준 적이 있다.
// 이전 앱에서 보이던 항목을 버리지 않도록 이런 값만 보정한다.
function normalizeLegacyEntry(entry: Record<string, unknown>) {
  const count =
    typeof entry.count === "number" && Number.isFinite(entry.count)
      ? Math.max(1, Math.round(entry.count))
      : entry.count;
  const item =
    isRecord(entry.item) && Array.isArray(entry.item.materials)
      ? {
          ...entry.item,
          materials: entry.item.materials.map((material: unknown) =>
            isRecord(material)
              ? {
                  ...material,
                  count: material.count ?? 0,
                  price: material.price ?? 0,
                }
              : material
          ),
        }
      : entry.item;
  return { ...entry, item, count, source: "server" };
}

// 이전 형식(결과 id → { item, count })을 변환한다.
// 출처 정보가 없으므로 기본 시세 결과로 간주한다.
export function migrateLegacyCart(value: unknown): Cart {
  if (!isRecord(value)) return {};

  return parseCart(
    Object.fromEntries(
      Object.entries(value).map(([id, entry]) => [
        id,
        isRecord(entry) ? normalizeLegacyEntry(entry) : entry,
      ])
    )
  );
}
