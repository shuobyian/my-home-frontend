import { findNewMarkets, mergeMarkets, parseMarketList } from "@/domain/market";

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
});
