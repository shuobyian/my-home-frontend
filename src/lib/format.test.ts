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

  it.each([
    [1234.5678, "1,234.57"],
    [0.5, "0.5"],
    [1000000.1, "1,000,000.1"],
  ])(
    "소수부에는 구분 기호를 넣지 않고 둘째 자리까지 쓴다: %p → %p",
    (input, expected) => {
      expect(formatNumber(input)).toBe(expected);
    }
  );
});

describe("formatNumber - 작은 값", () => {
  it.each([
    [0.004, "0.004"],
    [-0.001, "-0.001"],
    [-0, "0"],
  ])("%p → %p", (input, expected) => {
    expect(formatNumber(input)).toBe(expected);
  });
});

describe("formatGold", () => {
  it("천 단위 콤마 뒤에 '골드'를 붙인다", () => {
    expect(formatGold(1234567)).toBe("1,234,567골드");
  });
});
