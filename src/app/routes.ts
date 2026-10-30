// 라우트 경로. navigate·Link에는 이 절대 경로만 쓴다.
export const ROUTES = {
  HOME: "/",
  WALNUT: "/walnut",
  EXPERIENCE: "/experience",
  FREE: "/free",
  FREE_RESULT: "/free/result",
  FREE_CALCULATION: "/free/calculation",
  CALCULATION: "/calculation",
  INVENTORY: "/inventory",
  PROFILE: "/profile",
  REPORT: "/report",
  REPORT_NEW: "/report/new",
  // generatePath로 id를 채운다
  REPORT_DETAIL: "/report/:id",
  REPORT_EDIT: "/report/:id/edit",
  LOGIN: "/login",
  SIGNUP: "/signup",
  MANAGE: "/manage",
  MANAGE_PRODUCT: "/manage/product",
  MANAGE_MARKET: "/manage/market",
  MANAGE_CHECK: "/manage/check",
  MANAGE_LOG: "/manage/log",
} as const;
