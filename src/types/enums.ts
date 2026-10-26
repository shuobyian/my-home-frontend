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

// 기초 재료(시세)를 얻는 곳으로 나눈 분류. 보여 주는 순서대로 적는다.
// 값과 순서는 서버(my-home-backend apps/markets/models.py MarketGroup)와 같아야 한다(이름은 domain/labels.ts)
export const MarketGroupType = {
  CROP: "CROP",
  TREE_FRUIT: "TREE_FRUIT",
  TIMBER: "TIMBER",
  LIVESTOCK: "LIVESTOCK",
  ROBIN_SHOP: "ROBIN_SHOP",
  SEAFOOD: "SEAFOOD",
  SEA_GATHERING: "SEA_GATHERING",
  MINERAL: "MINERAL",
  GEM: "GEM",
  BUSH_GATHERING: "BUSH_GATHERING",
  STAR_FRUIT: "STAR_FRUIT",
  STARLIGHT: "STARLIGHT",
  BADGE: "BADGE",
  EVENT: "EVENT",
  ETC: "ETC",
} as const;
export type MarketGroup =
  (typeof MarketGroupType)[keyof typeof MarketGroupType];
