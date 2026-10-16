import { act, renderHook } from "@testing-library/react";
import { STORAGE_KEY } from "@/lib/storage";
import { ReactNode } from "react";
import { CartProvider, useCart } from "@/state/cart";
import { createResult } from "@/test/fixtures";
import { silenceExpectedErrors } from "@/test/silenceErrors";

const chair = createResult({
  id: 1,
  name: "나무 의자",
  materials: [{ name: "원목", count: 10, price: 5000 }],
});
const table = createResult({
  id: 3,
  name: "나무 탁자",
  materials: [{ name: "원목", count: 4, price: 2000 }],
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? "null");

beforeEach(() => {
  localStorage.clear();
});

describe("CartProvider / useCart", () => {
  it("담을 때마다 localStorage에 저장한다", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(chair, "server"));
    act(() => result.current.add(chair, "server"));

    expect(result.current.totalCount).toBe(2);
    expect(stored(STORAGE_KEY.CART)).toEqual({
      "server:1": { key: "server:1", source: "server", item: chair, count: 2 },
    });
  });

  it("새로 마운트해도 저장된 장바구니를 이어서 쓴다", () => {
    const { result: before, unmount } = renderHook(() => useCart(), {
      wrapper,
    });
    act(() => before.current.add(chair, "free"));
    unmount();

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(
      result.current.entries.map(({ source, item }) => [source, item.id])
    ).toEqual([["free", 1]]);
  });

  it("이전 형식으로 저장된 장바구니를 옮기고 이전 키를 지운다", () => {
    localStorage.setItem(
      STORAGE_KEY.LEGACY_CART,
      JSON.stringify({ [chair.id]: { item: chair, count: 3 } })
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.entries).toEqual([
      { key: "server:1", source: "server", item: chair, count: 3 },
    ]);
    expect(localStorage.getItem(STORAGE_KEY.LEGACY_CART)).toBeNull();
    expect(stored(STORAGE_KEY.CART)["server:1"].count).toBe(3);
  });

  it("새 형식 저장에 실패하면 이전 형식을 지우지 않는다(다음에 다시 옮긴다)", () => {
    localStorage.setItem(
      STORAGE_KEY.LEGACY_CART,
      JSON.stringify({ [chair.id]: { item: chair, count: 3 } })
    );
    const original = Storage.prototype.setItem;
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(function (this: Storage, key: string, value: string) {
        if (key === STORAGE_KEY.CART) throw new Error("QuotaExceededError");
        original.call(this, key, value);
      });

    renderHook(() => useCart(), { wrapper });
    spy.mockRestore();

    expect(localStorage.getItem(STORAGE_KEY.LEGACY_CART)).not.toBeNull();
    expect(localStorage.getItem(STORAGE_KEY.CART)).toBeNull();
  });

  it("저장값이 손상되어 있으면 빈 장바구니로 시작한다", () => {
    localStorage.setItem(STORAGE_KEY.CART, "{not json");

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.entries).toEqual([]);
  });

  it("담긴 결과의 기초 재료 합산을 제공한다", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(chair, "server"));
    act(() => result.current.add(table, "server"));
    act(() => result.current.setCount("server:1", 2));

    expect(result.current.materials).toEqual([
      { name: "원목", count: 24, price: 12000 },
    ]);
  });

  it("CartProvider 밖에서 쓰면 오류를 던진다", () => {
    silenceExpectedErrors();
    expect(() => renderHook(() => useCart())).toThrow(
      "useCart는 CartProvider 안에서만 사용할 수 있습니다."
    );
  });
});
