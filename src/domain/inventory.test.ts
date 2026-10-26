import {
  parseInventoryText,
  shortage,
  shortagePrice,
  sumShortagePrice,
  toOwnedCounts,
} from "@/domain/inventory";

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

  it.each([
    [10, 1000, 3, 700],
    [5, 500, 5, 0],
    [315.5, 2524000, 99, 1732000],
    [0, 0, 0, 0],
  ])(
    "필요 %d개·가격 %d골드, 보유 %d개면 부족 가격 %d골드",
    (count, price, owned, expected) => {
      expect(shortagePrice(count, price, owned)).toBe(expected);
    }
  );

  it("재료마다 부족한 만큼의 가격을 더한다(보유하지 않은 재료는 전부 부족)", () => {
    const materials = [
      { name: "원목", count: 80, price: 40000 },
      { name: "못", count: 5, price: 50 },
      { name: "천", count: 10, price: 300 },
    ];
    const owned = new Map([
      ["원목", 45],
      ["못", 99],
    ]);

    expect(sumShortagePrice(materials, owned)).toBe(17500 + 0 + 300);
  });

  describe("parseInventoryText", () => {
    const markets = [
      { id: 1, name: "원목", price: 500 },
      { id: 2, name: "못", price: 10 },
      { id: 3, name: "고급 천", price: 70 },
    ];

    it("한 줄에 하나씩 적은 재료명과 개수를 시세 id별로 읽는다", () => {
      const text = "원목 3\n못\t1,200\r\n\n 고급 천, 4개 \n";

      expect(parseInventoryText(text, markets)).toEqual({
        counts: new Map([
          [1, 3],
          [2, 1200],
          [3, 4],
        ]),
        skipped: [],
      });
    });

    it("형식이 틀리거나 시세에 없는 재료의 줄은 건너뛰고 알려 준다", () => {
      const text = "재료\t보유 개수\n원목\n철 5\n못 0\n원목 7";
      const { counts, skipped } = parseInventoryText(text, markets);

      // 같은 재료는 마지막 줄을 쓰고, 0개도 그대로 읽는다
      expect(counts).toEqual(
        new Map([
          [1, 7],
          [2, 0],
        ])
      );
      expect(skipped).toEqual(["재료\t보유 개수", "원목", "철 5"]);
    });
  });
});
