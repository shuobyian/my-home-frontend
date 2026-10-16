import { isResult, parseResultList } from "domain/result";
import { createResult } from "test/fixtures";

describe("isResult", () => {
  it("합산에 필요한 필드를 갖춘 결과면 true", () => {
    expect(isResult(createResult())).toBe(true);
  });

  it.each([
    null,
    [],
    { id: "1", name: "x", materials: [] },
    { id: 1, name: "x", materials: [{ name: "원목", count: "1", price: 1 }] },
  ])("형태가 맞지 않으면(%p) false", (value) => {
    expect(isResult(value)).toBe(false);
  });
});

describe("parseResultList", () => {
  it("결과 배열이면 그대로 반환한다", () => {
    const list = [createResult({ id: 1 }), createResult({ id: 2 })];
    expect(parseResultList(list)).toBe(list);
  });

  it("배열이 아니거나 하나라도 형태가 맞지 않으면 undefined", () => {
    expect(parseResultList(undefined)).toBeUndefined();
    expect(parseResultList({})).toBeUndefined();
    expect(parseResultList([createResult(), { id: 2 }])).toBeUndefined();
  });
});
