import { formatGold, formatNumber } from "lib/format";

describe("formatNumber", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [1000, "1,000"],
    [1234567, "1,234,567"],
    [-1234567, "-1,234,567"],
  ])("%p → %p", (input, expected) => {
    expect(formatNumber(input)).toBe(expected);
  });

  it.each([undefined, null, NaN])("%p이면 빈 문자열을 반환한다", (input) => {
    expect(formatNumber(input)).toBe("");
  });

  it.todo("소수 값의 소수부에도 콤마가 들어가는 문제 수정 (R45)");
});

describe("formatGold", () => {
  it("천 단위 콤마 뒤에 '골드'를 붙인다", () => {
    expect(formatGold(1234567)).toBe("1,234,567골드");
  });
});
