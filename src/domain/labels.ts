import { Category, CategoryType, Tool, ToolType } from "@/types/enums";

// Record로 정의해 enum 값이 추가되면 라벨 누락을 컴파일 시점에 잡는다
export const TOOL_LABEL: Record<Tool, string> = {
  [ToolType.WOOD]: "원목 작업대",
  [ToolType.FIRE_PIT]: "요리용 화덕",
  [ToolType.SEWING_MACHINE]: "재봉틀",
  [ToolType.LEATHER]: "가죽 작업대",
  [ToolType.BRAZIER]: "금속용 화로",
  [ToolType.POTTERY_WHEEL]: "도자기 물레",
  [ToolType.ALCHEMY_KETTLE]: "별님 연금솥",
  [ToolType.MIMI]: "미미 화덕",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  [CategoryType.NORMAL]: "일반",
  [CategoryType.EVENT]: "이벤트",
};

// Select 옵션 (enum 정의 순서)
export const TOOL_OPTIONS = Object.values(ToolType).map((value) => ({
  value,
  label: TOOL_LABEL[value],
}));

export const CATEGORY_OPTIONS = Object.values(CategoryType).map((value) => ({
  value,
  label: CATEGORY_LABEL[value],
}));

export function getToolLabel(tool: Tool) {
  return TOOL_LABEL[tool] ?? "";
}
