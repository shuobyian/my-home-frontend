import {
  diffMarketRows,
  findNewMarkets,
  mergeMarkets,
  parseMarketList,
  renameByServerId,
  validateMarketName,
} from "@/domain/market";
import { MarketGroupType } from "@/types/enums";

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

describe("findNewMarkets", () => {
  it("현재 목록에 없는 이름의 서버 재료만 서버 순서대로 반환한다", () => {
    const current = [{ name: "원목" }, { name: "천" }];
    const server = [
      { id: 1, name: "원목", price: 500 },
      { id: 84, name: "이스터 에그", price: 0 },
      { id: 2, name: "천", price: 300 },
      { id: 85, name: "금화", price: 10 },
    ];
    expect(findNewMarkets(current, server)).toEqual([server[1], server[3]]);
  });

  it("서버 목록 안에서 이름이 겹치면 먼저 나온 것만 반환한다", () => {
    const server = [
      { id: 84, name: "이스터 에그", price: 0 },
      { id: 90, name: "이스터 에그", price: 5 },
    ];
    expect(findNewMarkets([], server)).toEqual([server[0]]);
  });
});

describe("mergeMarkets", () => {
  const saved = [
    { id: 1, name: "원목", price: 700 },
    { id: 2, name: "천", price: null },
  ];

  it("저장본에 없는 서버 재료를 끝에 덧붙인다(가격은 서버 값)", () => {
    const server = [
      { id: 1, name: "원목", price: 500 },
      { id: 2, name: "천", price: 300 },
      { id: 84, name: "이스터 에그", price: 0 },
    ];
    expect(mergeMarkets(saved, server)).toEqual([
      ...saved,
      { id: 84, name: "이스터 에그", price: 0 },
    ]);
  });

  it("이미 있는 재료의 입력값(비운 칸 포함)은 서버 시세로 덮어쓰지 않는다", () => {
    const server = [
      { id: 1, name: "원목", price: 500 },
      { id: 2, name: "천", price: 300 },
    ];
    expect(mergeMarkets(saved, server)).toEqual(saved);
  });

  it("서버에 없어진 재료도 저장본에 그대로 둔다", () => {
    const server = [{ id: 84, name: "이스터 에그", price: 0 }];
    expect(mergeMarkets(saved, server)).toEqual([...saved, ...server]);
  });

  it("서버 시세가 중복 이름을 담아도 이름이 겹치지 않는다", () => {
    const server = [
      { id: 84, name: "이스터 에그", price: 0 },
      { id: 90, name: "이스터 에그", price: 5 },
      { id: 1, name: "원목", price: 500 },
    ];
    const names = mergeMarkets(saved, server).map(({ name }) => name);
    expect(names).toEqual(["원목", "천", "이스터 에그"]);
  });

  it("입력 배열을 바꾸지 않는다", () => {
    const before = structuredClone(saved);
    mergeMarkets(saved, [{ id: 84, name: "이스터 에그", price: 0 }]);
    expect(saved).toEqual(before);
  });

  it("서버에서 이름이 바뀐 재료(같은 id)는 입력값을 지킨 채 새 이름으로 바꾸고 덧붙이지 않는다", () => {
    const server = [
      { id: 1, name: "나무", price: 500 },
      { id: 2, name: "천", price: 300 },
    ];
    expect(mergeMarkets(saved, server)).toEqual([
      { id: 1, name: "나무", price: 700 },
      { id: 2, name: "천", price: null },
    ]);
  });
});

describe("renameByServerId", () => {
  it("같은 id의 서버 이름으로 바꾸고 나머지 필드는 지킨다(이전에 저장된 문자열 id 포함)", () => {
    const saved = [
      { id: 1, name: "나무", price: 99 },
      { id: "2" as unknown as number, name: "돌", price: 5 },
      { id: 3, name: "천", price: 7 },
    ];
    const server = [
      { id: 2, name: "바위", price: 50 },
      { id: 1, name: "원목", price: 10 },
    ];
    expect(renameByServerId(saved, server)).toEqual([
      { id: 1, name: "원목", price: 99 },
      { id: "2", name: "바위", price: 5 },
      // 서버에서 없어진 재료는 그대로 둔다
      { id: 3, name: "천", price: 7 },
    ]);
  });

  it("서로 이름을 맞바꾼 시세도 id를 따라 바꾼다", () => {
    const saved = [
      { id: 1, name: "금", price: 1 },
      { id: 2, name: "은", price: 2 },
    ];
    const server = [
      { id: 1, name: "은", price: 10 },
      { id: 2, name: "금", price: 20 },
    ];
    expect(renameByServerId(saved, server)).toEqual([
      { id: 1, name: "은", price: 1 },
      { id: 2, name: "금", price: 2 },
    ]);
  });

  it("바꾸면 다른 행과 이름이 겹치는 행은 그대로 둔다", () => {
    // 원목(id 5)은 서버에서 지워졌고, 나무(id 1)가 원목으로 바뀌었다
    const saved = [
      { id: 1, name: "나무", price: 99 },
      { id: 5, name: "원목", price: 50 },
    ];
    const server = [{ id: 1, name: "원목", price: 10 }];
    expect(renameByServerId(saved, server)).toBe(saved);
    // 덧붙이는 재료도 없어 같은 id의 행이 둘이 되지 않는다
    expect(mergeMarkets(saved, server)).toEqual(saved);
  });

  it("바꿀 것이 없으면 같은 배열을 돌려준다", () => {
    const saved = [{ id: 1, name: "원목", price: 99 }];
    expect(renameByServerId(saved, [{ id: 1, name: "원목", price: 1 }])).toBe(
      saved
    );
  });
});

describe("validateMarketName", () => {
  const others = new Set(["원목", "천"]);

  it.each([
    ["", "이름을 입력해주세요"],
    ["   ", "이름을 입력해주세요"],
    ["금,은", "이름에 쉼표(,)는 쓸 수 없습니다"],
    ["가".repeat(256), "255자 이하로 입력해주세요"],
    ["원목", "이미 있는 시세 이름입니다"],
    [" 천 ", "이미 있는 시세 이름입니다"],
  ])("%p → %s", (name, message) => {
    expect(validateMarketName(name, others)).toBe(message);
  });

  it("문제가 없으면 undefined(255자까지 허용)", () => {
    expect(validateMarketName("금", others)).toBeUndefined();
    expect(validateMarketName("가".repeat(255), others)).toBeUndefined();
  });
});

describe("diffMarketRows", () => {
  const original = [
    { id: 1, name: "원목", price: 500 },
    { id: 2, name: "천", price: 300 },
    { id: 3, name: "금", price: 1000 },
  ];

  it("바뀐 기존 행은 바뀐 필드만, 새 행은 id 없이 보내고 바뀌지 않은 행은 뺀다", () => {
    const { changes, renames } = diffMarketRows(original, [
      { id: 1, name: "원목", price: 700 },
      { id: 2, name: " 비단 ", price: 300 },
      { id: 3, name: "금", price: 1000 },
      { name: " 은 ", price: 50 },
    ]);

    expect(changes).toEqual([
      { id: 1, price: 700 },
      { id: 2, name: "비단" },
      { name: "은", price: 50 },
    ]);
    expect(renames).toEqual([{ from: "천", to: "비단" }]);
  });

  it("이름과 시세를 함께 바꾸면 한 항목에 담는다", () => {
    expect(
      diffMarketRows(original, [{ id: 1, name: "참나무", price: 900 }]).changes
    ).toEqual([{ id: 1, name: "참나무", price: 900 }]);
  });

  it("기존 행의 비운 시세 칸은 바꾸지 않은 것으로 보고, 새 행은 비운 채로 담는다", () => {
    expect(
      diffMarketRows(original, [
        { id: 1, name: "원목", price: null },
        { name: "은", price: null },
      ]).changes
    ).toEqual([{ name: "은" }]);
  });

  it("분류는 바뀐 기존 행만 보내고(고르지 않은 행은 그대로), 새 행은 고른 분류를 함께 담는다", () => {
    const grouped = original.map((market) => ({
      ...market,
      group: MarketGroupType.ETC,
    }));
    expect(
      diffMarketRows(grouped, [
        { id: 1, name: "원목", price: 500, group: MarketGroupType.TIMBER },
        { id: 2, name: "천", price: 300, group: MarketGroupType.ETC },
        { id: 3, name: "금", price: 1000 },
        { name: "은", price: 50, group: MarketGroupType.MINERAL },
      ]).changes
    ).toEqual([
      { id: 1, group: MarketGroupType.TIMBER },
      { name: "은", price: 50, group: MarketGroupType.MINERAL },
    ]);
  });

  it("서버에 없는 id의 행은 전체 값을 보내 서버가 알리게 한다", () => {
    expect(
      diffMarketRows(original, [{ id: 99, name: "철", price: 10 }]).changes
    ).toEqual([{ id: 99, name: "철", price: 10 }]);
  });

  it("바뀐 것이 없으면 빈 목록", () => {
    expect(diffMarketRows(original, original)).toEqual({
      changes: [],
      renames: [],
    });
  });
});
