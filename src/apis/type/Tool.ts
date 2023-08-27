export const ToolType = {
  WOOD: "WOOD",
  FIRE_PIT: "FIRE_PIT",
  SEWING_MACHINE: "SEWING_MACHINE",
  LEATHER: "LEATHER",
  BRAZIER: "BRAZIER",
  POTTERY_WHEEL: "POTTERY_WHEEL",
  ALCHEMY_KETTLE: "ALCHEMY_KETTLE",
} as const;
export type Tool = (typeof ToolType)[keyof typeof ToolType];

export const ToolList = [
  {
    value: ToolType.WOOD,
    label: "원목 작업대",
  },
  {
    value: ToolType.FIRE_PIT,
    label: "요리용 화덕",
  },
  {
    value: ToolType.SEWING_MACHINE,
    label: "재봉틀",
  },
  {
    value: ToolType.LEATHER,
    label: "가죽 작업대",
  },
  {
    value: ToolType.BRAZIER,
    label: "금속용 화로",
  },
  {
    value: ToolType.POTTERY_WHEEL,
    label: "도자기 물레",
  },
  {
    value: ToolType.ALCHEMY_KETTLE,
    label: "별님 연금솥",
  },
];

export function getToolLabel(tool: Tool) {
  return ToolList.find(({ value }) => value === tool)?.label ?? "";
}
