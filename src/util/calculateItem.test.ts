import { createResult } from "test/fixtures";
import { calculateItem } from "util/calculateItem";
import { StorageResult } from "util/hook/useSelectedResults";

const chair = createResult({
  id: 1,
  name: "나무 의자",
  materials: [
    { name: "원목", count: 10, price: 5000 },
    { name: "천", count: 2, price: 300 },
  ],
});

const vase = createResult({
  id: 2,
  name: "꽃병",
  materials: [{ name: "돌", count: 4, price: 2000 }],
});

const table = createResult({
  id: 3,
  name: "나무 탁자",
  materials: [{ name: "원목", count: 4, price: 2000 }],
});

describe("calculateItem", () => {
  it("빈 장바구니면 빈 배열을 반환한다", () => {
    expect(calculateItem({})).toEqual([]);
  });

  it("담은 수량만큼 재료 개수와 가격을 곱하고, 처음 등장한 순서를 유지한다", () => {
    const cart: StorageResult = {
      [chair.id]: { item: chair, count: 2 },
      [vase.id]: { item: vase, count: 1 },
    };

    expect(calculateItem(cart)).toEqual([
      { name: "원목", count: 20, price: 10000 },
      { name: "천", count: 4, price: 600 },
      { name: "돌", count: 4, price: 2000 },
    ]);
  });

  it("여러 결과에 같은 재료가 있으면 개수와 가격을 합산한다", () => {
    const cart: StorageResult = {
      [chair.id]: { item: chair, count: 2 },
      [table.id]: { item: table, count: 1 },
    };

    // 원목: 개수 10×2 + 4×1 = 24, 가격 5000×2 + 2000×1 = 12000
    expect(calculateItem(cart)).toEqual([
      { name: "원목", count: 24, price: 12000 },
      { name: "천", count: 4, price: 600 },
    ]);
  });

  it("입력을 변경하지 않는다", () => {
    const cart: StorageResult = {
      [chair.id]: { item: chair, count: 2 },
      [table.id]: { item: table, count: 1 },
    };
    const snapshot = JSON.parse(JSON.stringify(cart));

    calculateItem(cart);

    expect(cart).toEqual(snapshot);
  });
});
