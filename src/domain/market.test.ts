import { parseMarketList } from "@/domain/market";

describe("parseMarketList", () => {
  it("시세 배열이면 그대로 반환한다(입력 전 빈 시세 포함)", () => {
    const list = [
      { id: 1, name: "원목", price: 500 },
      { id: 2, name: "천", price: null },
    ];
    expect(parseMarketList(list)).toBe(list);
  });

  it.each([
    undefined,
    {},
    [{ id: null, name: "원목", price: 500 }],
    [{ id: 1, name: 3, price: 1 }],
  ])("형태가 맞지 않으면(%p) undefined", (value) => {
    expect(parseMarketList(value)).toBeUndefined();
  });
});
