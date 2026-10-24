import { Market, MarketUpdateItem } from "@/types/market";

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

// 저장해 둔 시세의 이름을 서버에 맞춘다. 관리자가 시세 이름을 바꿔도 id는 그대로이므로,
// 같은 id의 서버 시세가 있으면 그 이름으로 바꾸고 나머지(입력한 시세)는 지킨다.
// 바꾸면 다른 행과 이름이 겹치는 행(서버에서 지워진 재료와 같은 이름 등)은 그대로 둔다.
// 바꾼 것이 없으면 같은 배열을 돌려준다.
export function renameByServerId<T extends Pick<Market, "id" | "name">>(
  saved: readonly T[],
  server: readonly Market[]
): readonly T[] {
  const serverNames = new Map(server.map(({ id, name }) => [id, name]));
  // 행마다 바꿀 이름(바꾸지 않으면 undefined). 이전에 저장된 문자열 id도 숫자로 맞춰 본다
  const renames = saved.map(({ id, name }) => {
    const serverName = serverNames.get(Number(id));
    return serverName !== undefined && serverName !== name
      ? serverName
      : undefined;
  });
  const nameAt = (index: number) => renames[index] ?? saved[index].name;

  // 겹치는 이름으로 바꾸려던 행을 되돌린다. 되돌린 이름이 또 겹칠 수 있으므로 겹침이 없을 때까지 반복한다
  let reverted = true;
  while (reverted) {
    reverted = false;
    const counts = new Map<string, number>();
    saved.forEach((_, index) =>
      counts.set(nameAt(index), (counts.get(nameAt(index)) ?? 0) + 1)
    );
    renames.forEach((rename, index) => {
      if (rename !== undefined && (counts.get(rename) ?? 0) > 1) {
        renames[index] = undefined;
        reverted = true;
      }
    });
  }

  return renames.some((rename) => rename !== undefined)
    ? saved.map((row, index) =>
        renames[index] === undefined ? row : { ...row, name: renames[index] }
      )
    : saved;
}

// 저장해 둔 시세를 서버에 맞춘다. 이름이 바뀐 재료(같은 id)는 새 이름으로 바꾸고(renameByServerId),
// 서버에만 있는 재료는 끝에 덧붙인다(이름 기준).
// 이미 있는 재료는 입력값을 그대로 두고, 서버에서 없어진 재료도 지우지 않는다.
export function mergeMarkets<T extends Pick<Market, "id" | "name">>(
  saved: readonly T[],
  server: readonly Market[]
): (T | Market)[] {
  const renamed = renameByServerId(saved, server);
  return [...renamed, ...findNewMarkets(renamed, server)];
}

// 서버(시세 serializer)와 같은 이름 길이 한계
const NAME_MAX_LENGTH = 255;

// 시세 이름 검사. otherNames는 겹치면 안 되는 다른 이름(서버 시세, 같은 표의 다른 행)이다.
// 서버는 앞뒤 공백을 지우고 저장하므로 지운 이름으로 비교한다.
export function validateMarketName(
  name: string,
  otherNames: ReadonlySet<string>
): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return "이름을 입력해주세요";
  // 결과의 재료 목록을 쉼표로 이어 저장하므로 서버가 쉼표를 받지 않는다
  if (trimmed.includes(",")) return "이름에 쉼표(,)는 쓸 수 없습니다";
  if (trimmed.length > NAME_MAX_LENGTH) return "255자 이하로 입력해주세요";
  if (otherNames.has(trimmed)) return "이미 있는 시세 이름입니다";
  return undefined;
}

// 시세 편집 표의 한 행. 새 행은 id가 없고, 비운 시세 칸은 null이다.
export interface MarketRowValue {
  id?: number;
  name: string;
  price: number | null;
}

export interface MarketRowDiff {
  // PUT /market 본문. 기존 행은 바뀐 필드만 { id, name?, price? }로, 새 행은 { name, price }로 보낸다
  changes: MarketUpdateItem[];
  // 이름을 바꾼 기존 시세(원래 이름 → 새 이름)
  renames: { from: string; to: string }[];
}

// 서버 시세와 편집한 표를 비교해 바뀐 것만 고른다(표 순서). 바뀌지 않은 행은 빼고,
// 비운 시세 칸(null)은 기존 행에서는 바꾸지 않은 것으로 본다(저장 전 검증이 막는다).
export function diffMarketRows(
  original: readonly Market[],
  rows: readonly MarketRowValue[]
): MarketRowDiff {
  const byId = new Map(original.map((market) => [market.id, market]));
  const changes: MarketUpdateItem[] = [];
  const renames: MarketRowDiff["renames"] = [];

  rows.forEach(({ id, name, price }) => {
    const trimmed = name.trim();
    const before = id === undefined ? undefined : byId.get(id);
    if (id === undefined || !before) {
      // 새 행. 서버에서 사라진 id는 그대로 보내 서버가 알리게 한다("존재하지 않는 시세입니다")
      changes.push({
        ...(id !== undefined && { id }),
        name: trimmed,
        ...(price !== null && { price }),
      });
      return;
    }
    const change: MarketUpdateItem = {};
    if (trimmed !== before.name) {
      change.name = trimmed;
      renames.push({ from: before.name, to: trimmed });
    }
    if (price !== null && price !== before.price) change.price = price;
    if (Object.keys(change).length > 0) changes.push({ id, ...change });
  });

  return { changes, renames };
}
