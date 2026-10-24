import { AuthSession, User } from "@/types/auth";
import { CatalogCheck, CatalogProblem } from "@/types/catalog";
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

// 테스트용 점검 문제(기본: 나무 의자의 원목 시세 없음). 필요한 필드만 덮어쓴다.
export function createProblem(
  overrides: Partial<CatalogProblem> = {}
): CatalogProblem {
  return {
    code: "MISSING_PRICE",
    severity: "error",
    productId: 1,
    productName: "나무 의자",
    material: "원목",
    marketId: null,
    related: [],
    hint: "새 재료라면 시세를 추가하고, 오타라면 레시피를 고치세요.",
    message: "시세 정보가 없는 재료가 있습니다. (나무 의자: 원목)",
    ...overrides,
  };
}

// 테스트용 점검 결과(기본: 문제 없는 물품 1개·시세 1개).
// summary는 따로 넘기지 않으면 목록에서 센다.
export function createCatalogCheck(
  overrides: Partial<CatalogCheck> = {}
): CatalogCheck {
  const {
    products = [{ id: 1, name: "나무 의자", status: "ok", resultId: 1 }],
    markets = [{ id: 1, name: "원목", price: 500, usedBy: ["나무 의자"] }],
    problems = [],
  } = overrides;
  const count = (severity: CatalogProblem["severity"]) =>
    problems.filter((problem) => problem.severity === severity).length;
  return {
    summary: {
      products: products.length,
      markets: markets.length,
      results: products.filter(({ resultId }) => resultId !== null).length,
      errors: count("error"),
      warnings: count("warning"),
      infos: count("info"),
    },
    products,
    markets,
    problems,
    ...overrides,
  };
}
