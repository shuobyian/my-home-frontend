import { AuthSession, User } from "@/types/auth";
import { CategoryType, ToolType } from "@/types/enums";
import { Product } from "@/types/product";
import { Result } from "@/types/result";

// 테스트용 Product를 만든다. 필요한 필드만 덮어쓴다.
export function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: "나무 의자",
    level: 1,
    craftingPrice: 100,
    tool: ToolType.WOOD,
    category: CategoryType.NORMAL,
    materials: [{ name: "원목", basic: true, count: 1 }],
    ...overrides,
  };
}

// 테스트용 Result(서버 계산 결과)를 만든다. 필요한 필드만 덮어쓴다.
export function createResult(overrides: Partial<Result> = {}): Result {
  return {
    id: 1,
    createdAt: "2026-01-01T00:00:00",
    product: createProduct(),
    name: "나무 의자",
    level: 1,
    tool: ToolType.WOOD,
    category: CategoryType.NORMAL,
    craftingPrice: 100,
    materials: [{ name: "원목", count: 1, price: 500 }],
    totalPrice: 500,
    ...overrides,
  };
}

// 테스트용 로그인 세션(기본: 관리자, 한 시간 뒤 만료). 필요한 필드만 덮어쓴다.
export function createSession(
  overrides: Partial<AuthSession> = {},
  user: Partial<User> = {}
): AuthSession {
  return {
    token: "token-1",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    user: { id: 1, username: "admin", isAdmin: true, ...user },
    ...overrides,
  };
}
