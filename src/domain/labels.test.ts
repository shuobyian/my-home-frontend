import { CATEGORY_OPTIONS, getToolLabel, TOOL_OPTIONS } from "@/domain/labels";
import { Tool, ToolType } from "@/types/enums";

describe("getToolLabel", () => {
  it("도구 값에 해당하는 한글 라벨을 반환한다", () => {
    expect(getToolLabel(ToolType.WOOD)).toBe("원목 작업대");
    expect(getToolLabel(ToolType.MIMI)).toBe("미미 화덕");
  });

  it("알 수 없는 값이면 빈 문자열을 반환한다", () => {
    expect(getToolLabel("UNKNOWN" as Tool)).toBe("");
  });
});

describe("Select 옵션", () => {
  it("모든 도구가 enum 정의 순서대로 라벨과 함께 들어 있다", () => {
    expect(TOOL_OPTIONS.map(({ value }) => value)).toEqual(
      Object.values(ToolType)
    );
    TOOL_OPTIONS.forEach(({ label }) => expect(label).not.toBe(""));
  });

  it("모든 카테고리가 순서대로 들어 있다", () => {
    expect(CATEGORY_OPTIONS).toEqual([
      { value: "NORMAL", label: "일반" },
      { value: "EVENT", label: "이벤트" },
    ]);
  });
});
