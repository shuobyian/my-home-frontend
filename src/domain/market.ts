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
