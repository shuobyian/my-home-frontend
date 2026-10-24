import { shortage, toOwnedCounts } from "@/domain/inventory";

describe("inventory", () => {
  it("보유 재료를 재료 이름별 개수로 바꾼다", () => {
    const owned = toOwnedCounts([
      { marketId: 1, name: "원목", count: 3 },
      { marketId: 2, name: "못", count: 120 },
    ]);

    expect(owned.get("원목")).toBe(3);
    expect(owned.get("못")).toBe(120);
    expect(owned.get("천")).toBeUndefined();
  });

  it.each([
    [10, 3, 7],
    [5, 5, 0],
    [3, 10, 0],
    [4, 0, 4],
  ])("필요 %i개, 보유 %i개면 부족 %i개", (count, owned, expected) => {
    expect(shortage(count, owned)).toBe(expected);
  });
});
