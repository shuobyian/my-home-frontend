// 라우트 경로. navigate·Link에는 이 절대 경로만 쓴다.
export const ROUTES = {
  HOME: "/",
  WALNUT: "/walnut",
  EXPERIENCE: "/experience",
  FREE: "/free",
  FREE_RESULT: "/free/result",
  CALCULATION: "/calculation",
  MANAGE: "/manage",
  MANAGE_PRODUCT: "/manage/product",
  MANAGE_MARKET: "/manage/market",
} as const;

// React Router v7 동작을 미리 켠다(앱과 테스트가 같은 설정을 쓴다).
// 이동을 transition으로 처리해 지연 로딩 화면을 받는 동안 이전 화면을 유지하고,
// splat 라우트의 상대 경로 해석을 v7과 맞춘다.
export const ROUTER_FUTURE = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;
