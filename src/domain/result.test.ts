import {
  getTotalCost,
  isResult,
  MUNG_UNIT,
  parseResultList,
  requiresAffinity,
  toMung,
} from "domain/result";
import { ToolType } from "types/enums";
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

describe("toMung", () => {
  it.each([
    [0, 0],
    [98, 0],
    [MUNG_UNIT, 1],
    [250, 2],
  ])("%p개 → %p뭉", (count, mung) => {
    expect(toMung(count)).toBe(mung);
  });
});

describe("getTotalCost", () => {
  it("재료비와 제작비를 더한다", () => {
    expect(
      getTotalCost(createResult({ totalPrice: 5300, craftingPrice: 100 }))
    ).toBe(5400);
  });
});

describe("requiresAffinity", () => {
  it("미미 화덕 물품이면 true", () => {
    expect(requiresAffinity(createResult({ tool: ToolType.MIMI }))).toBe(true);
    expect(requiresAffinity(createResult({ tool: ToolType.WOOD }))).toBe(false);
  });

  it("이름에 '미미'가 있어도 도구가 다르면 false(이전에는 이름으로 판정)", () => {
    expect(
      requiresAffinity(
        createResult({ name: "미미 인형", tool: ToolType.SEWING_MACHINE })
      )
    ).toBe(false);
  });
});
