import { WalnutParams } from "@/types/experience";
import { ProductSearchParams } from "@/types/product";
import { CalculatorRequest, ResultSearchParams } from "@/types/result";

// 쿼리 키를 한곳에 모은다. 물품·시세·결과는 서버에서 함께 맞춰지므로
// 하나를 바꾸면 invalidate.ts가 여기 있는 키를 함께 무효화한다.

export const productKeys = {
  all: ["product"] as const,
  list: (params: ProductSearchParams) =>
    [...productKeys.all, "list", params] as const,
  // 쪽을 나누지 않은 전체 목록
  allList: ["product", "all"] as const,
};

export const marketKeys = {
  all: ["market"] as const,
};

export const resultKeys = {
  all: ["result"] as const,
  list: (params: ResultSearchParams) =>
    [...resultKeys.all, "list", params] as const,
};

export const calculatorKeys = {
  all: ["calculator"] as const,
  result: (body: CalculatorRequest) => [...calculatorKeys.all, body] as const,
};

export const experienceKeys = {
  all: ["experience"] as const,
  list: () => [...experienceKeys.all, "list"] as const,
  // 조건과 상관없이 모든 호두작 계산(무효화용)
  walnutAll: ["experience", "walnut"] as const,
  walnut: (params?: WalnutParams) =>
    [...experienceKeys.walnutAll, params] as const,
};

// 회원마다 다르므로 회원 id를 키에 넣는다(다른 계정으로 바꿔 로그인해도 앞 계정의 값을 보여 주지 않는다)
export const inventoryKeys = {
  all: ["inventory"] as const,
  mine: (userId: number | undefined) => [...inventoryKeys.all, userId] as const,
};

export const catalogKeys = {
  all: ["catalog"] as const,
  check: ["catalog", "check"] as const,
};
