import { Market } from "@/types/market";

function isMarket(value: unknown): value is Market {
  if (typeof value !== "object" || value === null) return false;
  const { id, name, price } = value as Record<string, unknown>;
  return (
    // 서버 id는 정수지만, 이전에 저장된 값과의 호환을 위해 문자열도 받는다
    (typeof id === "number" || typeof id === "string") &&
    typeof name === "string" &&
    (typeof price === "number" || price === null || price === undefined)
  );
}

// 저장된 시세 목록을 복원한다. 형태가 맞지 않으면 undefined.
export function parseMarketList(value: unknown): Market[] | undefined {
  return Array.isArray(value) && value.every(isMarket) ? value : undefined;
}

// 서버 시세 가운데 현재 목록에 없는 이름의 재료만 골라 서버 순서대로 반환한다.
// 서버 목록 안에서 이름이 겹치면 먼저 나온 것만 쓴다.
export function findNewMarkets(
  current: readonly Pick<Market, "name">[],
  server: readonly Market[]
): Market[] {
  const names = new Set(current.map(({ name }) => name));
  return server.filter(({ name }) => {
    if (names.has(name)) return false;
    names.add(name);
    return true;
  });
}

// 저장해 둔 시세에 서버에만 있는 재료를 끝에 덧붙인다(이름 기준).
// 이미 있는 재료는 입력값을 그대로 두고, 서버에서 없어진 재료도 지우지 않는다.
export function mergeMarkets<T extends Pick<Market, "name">>(
  saved: readonly T[],
  server: readonly Market[]
): (T | Market)[] {
  return [...saved, ...findNewMarkets(saved, server)];
}
