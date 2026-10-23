// API 엔드포인트 경로 (baseURL은 apis/client.ts)
export const ENDPOINTS = {
  PRODUCT: "/product",
  PRODUCT_ALL: "/product/all",
  RESULT: "/result",
  CALCULATOR: "/result/calculator",
  MARKET: "/market",
  EXPERIENCE: "/experience",
  WALNUT: "/experience/walnut",
  AUTH_SIGNUP: "/auth/signup",
  AUTH_LOGIN: "/auth/login",
  AUTH_LOGOUT: "/auth/logout",
} as const;
