import { fileTimestamp } from "@/lib/excel";

describe("fileTimestamp", () => {
  it("공백·콜론 없는 날짜 문자열을 만든다", () => {
    expect(fileTimestamp(new Date(2026, 9, 7, 9, 5))).toBe("20261007-0905");
  });
});
