// API 엔드포인트 경로 (baseURL은 apis/client.ts)
export const ENDPOINTS = {
  PRODUCT: "/product",
  PRODUCT_ALL: "/product/all",
  RESULT: "/result",
  CALCULATOR: "/result/calculator",
  MARKET: "/market",
  CATALOG_CHECK: "/catalog/check",
  EXPERIENCE: "/experience",
  WALNUT: "/experience/walnut",
  AUTH_SIGNUP: "/auth/signup",
  AUTH_LOGIN: "/auth/login",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_ME: "/auth/me",
  INVENTORY: "/inventory",
  REPORT: "/report",
  LOG: "/log",
} as const;
