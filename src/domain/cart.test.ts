import {
  aggregateMaterials,
  Cart,
  cartKey,
  cartReducer,
  CartSource,
  migrateLegacyCart,
  parseCart,
  sumPrice,
  totalCount,
} from "domain/cart";
import { createResult } from "test/fixtures";
import { Result } from "types/result";

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

function cartOf(...entries: [CartSource, Result, number][]): Cart {
  return Object.fromEntries(
    entries.map(([source, item, count]) => {
      const key = cartKey(source, item.id);
      return [key, { key, source, item, count }];
    })
  );
}

describe("aggregateMaterials", () => {
  it("빈 장바구니면 빈 배열을 반환한다", () => {
    expect(aggregateMaterials({})).toEqual([]);
  });

  it("담은 수량만큼 재료 개수와 가격을 곱하고, 처음 등장한 순서를 유지한다", () => {
    expect(
      aggregateMaterials(cartOf(["server", chair, 2], ["server", vase, 1]))
    ).toEqual([
      { name: "원목", count: 20, price: 10000 },
      { name: "천", count: 4, price: 600 },
      { name: "돌", count: 4, price: 2000 },
    ]);
  });

  it("여러 결과에 같은 재료가 있으면 개수와 가격을 합산한다", () => {
    // 원목: 개수 10×2 + 4×3 = 32, 가격 5000×2 + 2000×3 = 16000
    expect(
      aggregateMaterials(cartOf(["server", chair, 2], ["server", table, 3]))
    ).toEqual([
      { name: "원목", count: 32, price: 16000 },
      { name: "천", count: 4, price: 600 },
    ]);
  });

  it("입력을 변경하지 않는다", () => {
    const cart = cartOf(["server", chair, 2], ["free", table, 1]);
    const snapshot = JSON.parse(JSON.stringify(cart));

    aggregateMaterials(cart);

    expect(cart).toEqual(snapshot);
  });
});

describe("sumPrice / totalCount", () => {
  it("재료 가격을 모두 더한다", () => {
    expect(
      sumPrice([
        { name: "원목", count: 24, price: 12000 },
        { name: "천", count: 4, price: 600 },
      ])
    ).toBe(12600);
    expect(sumPrice([])).toBe(0);
  });

  it("담긴 수량을 모두 더한다", () => {
    expect(totalCount(cartOf(["server", chair, 2], ["free", chair, 3]))).toBe(
      5
    );
    expect(totalCount({})).toBe(0);
  });
});

describe("cartReducer", () => {
  it("add: 새 결과는 1개로 담고, 같은 출처의 같은 결과는 수량을 늘린다", () => {
    let cart = cartReducer({}, { type: "add", source: "server", item: chair });
    cart = cartReducer(cart, { type: "add", source: "server", item: chair });

    expect(cart).toEqual(cartOf(["server", chair, 2]));
  });

  it("add: 출처가 다르면 같은 id라도 따로 담는다", () => {
    let cart = cartReducer({}, { type: "add", source: "server", item: chair });
    cart = cartReducer(cart, { type: "add", source: "free", item: chair });

    expect(Object.keys(cart)).toEqual(["server:1", "free:1"]);
  });

  it("add: 이미 담긴 결과는 처음 담은 스냅샷(가격)을 유지한다", () => {
    const repriced = { ...chair, totalPrice: 999999 };
    let cart = cartReducer({}, { type: "add", source: "server", item: chair });
    cart = cartReducer(cart, { type: "add", source: "server", item: repriced });

    expect(cart["server:1"].item).toBe(chair);
    expect(cart["server:1"].count).toBe(2);
  });

  it("increment / decrement: 1개에서 줄이면 항목을 삭제한다", () => {
    let cart = cartOf(["server", chair, 1]);
    cart = cartReducer(cart, { type: "increment", key: "server:1" });
    expect(cart["server:1"].count).toBe(2);

    cart = cartReducer(cart, { type: "decrement", key: "server:1" });
    expect(cart["server:1"].count).toBe(1);

    cart = cartReducer(cart, { type: "decrement", key: "server:1" });
    expect(cart).toEqual({});
  });

  it.each([0, -3, 1.5, NaN])(
    "setCount: 1 이상의 정수가 아니면(%p) 무시한다",
    (count) => {
      const cart = cartOf(["server", chair, 2]);
      expect(
        cartReducer(cart, { type: "setCount", key: "server:1", count })
      ).toBe(cart);
    }
  );

  it("setCount: 수량을 지정한 값으로 바꾼다", () => {
    const cart = cartReducer(cartOf(["server", chair, 2]), {
      type: "setCount",
      key: "server:1",
      count: 7,
    });
    expect(cart["server:1"].count).toBe(7);
  });

  it("remove / clear", () => {
    const cart = cartOf(["server", chair, 1], ["server", vase, 2]);

    expect(cartReducer(cart, { type: "remove", key: "server:1" })).toEqual(
      cartOf(["server", vase, 2])
    );
    expect(cartReducer(cart, { type: "clear" })).toEqual({});
  });

  it("없는 키에 대한 동작은 상태를 바꾸지 않는다", () => {
    const cart = cartOf(["server", chair, 1]);
    expect(cartReducer(cart, { type: "increment", key: "server:999" })).toBe(
      cart
    );
  });

  it("이전 상태를 변경하지 않는다", () => {
    const cart = cartOf(["server", chair, 1]);
    const snapshot = JSON.parse(JSON.stringify(cart));

    cartReducer(cart, { type: "add", source: "server", item: chair });
    cartReducer(cart, { type: "increment", key: "server:1" });
    cartReducer(cart, { type: "setCount", key: "server:1", count: 5 });

    expect(cart).toEqual(snapshot);
  });
});

describe("parseCart", () => {
  it("올바른 저장값을 그대로 복원한다", () => {
    const cart = cartOf(["server", chair, 2], ["walnut", vase, 1]);
    expect(parseCart(JSON.parse(JSON.stringify(cart)))).toEqual(cart);
  });

  it.each([null, "문자열", 3, []])(
    "객체가 아니면(%p) 빈 장바구니를 반환한다",
    (value) => {
      expect(parseCart(value)).toEqual({});
    }
  );

  it("형태가 맞지 않는 항목만 버린다", () => {
    const valid = cartOf(["server", chair, 2]);
    const saved = {
      ...valid,
      "x:1": { source: "unknown", item: chair, count: 1 },
      "server:2": { source: "server", item: vase, count: 0 },
      "server:3": { source: "server", item: { id: 3 }, count: 1 },
    };

    expect(parseCart(saved)).toEqual(valid);
  });
});

describe("migrateLegacyCart", () => {
  it("이전 형식(결과 id → { item, count })을 기본 시세 출처로 변환한다", () => {
    const legacy = {
      [chair.id]: { item: chair, count: 2 },
      [vase.id]: { item: vase, count: 1 },
    };

    expect(migrateLegacyCart(legacy)).toEqual(
      cartOf(["server", chair, 2], ["server", vase, 1])
    );
  });

  it("손상된 값은 빈 장바구니로 변환한다", () => {
    expect(migrateLegacyCart("{not json")).toEqual({});
    expect(migrateLegacyCart({ 1: { item: null, count: 1 } })).toEqual({});
  });
});
