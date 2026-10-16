import { Market } from "types/market";

function isMarket(value: unknown): value is Market {
  if (typeof value !== "object" || value === null) return false;
  const { id, name, price } = value as Record<string, unknown>;
  return (
    typeof id === "string" &&
    typeof name === "string" &&
    (typeof price === "number" || price === null || price === undefined)
  );
}

// 저장된 시세 목록을 복원한다. 형태가 맞지 않으면 undefined.
export function parseMarketList(value: unknown): Market[] | undefined {
  return Array.isArray(value) && value.every(isMarket) ? value : undefined;
}
