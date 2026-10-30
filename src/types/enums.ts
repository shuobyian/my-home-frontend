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

// 제보 게시판. 값은 서버(my-home-backend apps/reports/models.py)와 같아야 한다(이름은 domain/labels.ts)
export const ReportKindType = {
  DATA: "DATA",
  BUG: "BUG",
} as const;
export type ReportKind = (typeof ReportKindType)[keyof typeof ReportKindType];

export const ReportStatusType = {
  OPEN: "OPEN",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
} as const;
export type ReportStatus =
  (typeof ReportStatusType)[keyof typeof ReportStatusType];

// 바꿀 값이 가리키는 데이터. 대상마다 바꿀 수 있는 값은 domain/report.ts에 있다
export const ChangeTargetType = {
  EXPERIENCE: "EXPERIENCE",
  MARKET: "MARKET",
  PRODUCT: "PRODUCT",
  MATERIAL: "MATERIAL",
} as const;
export type ChangeTarget =
  (typeof ChangeTargetType)[keyof typeof ChangeTargetType];

// 활동 로그 종류. 값은 서버(my-home-backend apps/logs/models.py Action)와 같아야 한다
export const ActivityActionType = {
  SIGNUP: "SIGNUP",
  LOGIN: "LOGIN",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  PROFILE_UPDATE: "PROFILE_UPDATE",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  WITHDRAW: "WITHDRAW",
  REPORT_CREATE: "REPORT_CREATE",
  REPORT_UPDATE: "REPORT_UPDATE",
  REPORT_DELETE: "REPORT_DELETE",
  REPORT_ANSWER: "REPORT_ANSWER",
} as const;
export type ActivityAction =
  (typeof ActivityActionType)[keyof typeof ActivityActionType];
