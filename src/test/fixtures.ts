import { Product } from "apis/product/getProducts";
import { Result } from "apis/result/getResults";
import { Category } from "apis/type/Category";
import { ToolType } from "apis/type/Tool";

// 테스트용 Product를 만든다. 필요한 필드만 덮어쓴다.
export function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: "나무 의자",
    level: 1,
    craftingPrice: 100,
    tool: ToolType.WOOD,
    category: Category.NORMAL,
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
    craftingPrice: 100,
    materials: [{ name: "원목", count: 1, price: 500 }],
    totalPrice: 500,
    ...overrides,
  };
}
