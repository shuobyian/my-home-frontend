// 서버와 주고받는 enum 값. 값 객체(XxxType)와 유니온 타입(Xxx)을 구분해 정의한다.

export const ToolType = {
  WOOD: "WOOD",
  FIRE_PIT: "FIRE_PIT",
  SEWING_MACHINE: "SEWING_MACHINE",
  LEATHER: "LEATHER",
  BRAZIER: "BRAZIER",
  POTTERY_WHEEL: "POTTERY_WHEEL",
  ALCHEMY_KETTLE: "ALCHEMY_KETTLE",
  MIMI: "MIMI",
} as const;
export type Tool = (typeof ToolType)[keyof typeof ToolType];

export const CategoryType = {
  NORMAL: "NORMAL",
  EVENT: "EVENT",
} as const;
export type Category = (typeof CategoryType)[keyof typeof CategoryType];
