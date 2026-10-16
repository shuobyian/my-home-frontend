import { getToolLabel, Tool, ToolList, ToolType } from "apis/type/Tool";

describe("getToolLabel", () => {
  it("도구 값에 해당하는 한글 라벨을 반환한다", () => {
    expect(getToolLabel(ToolType.WOOD)).toBe("원목 작업대");
    expect(getToolLabel(ToolType.MIMI)).toBe("미미 화덕");
  });

  it("모든 ToolType 값에 라벨이 정의되어 있다", () => {
    Object.values(ToolType).forEach((tool) => {
      expect(getToolLabel(tool)).not.toBe("");
    });
    expect(ToolList).toHaveLength(Object.values(ToolType).length);
  });

  it("알 수 없는 값이면 빈 문자열을 반환한다", () => {
    expect(getToolLabel("UNKNOWN" as Tool)).toBe("");
  });
});
