// 서버의 데이터 점검(GET /catalog/check). 시세·물품·결과가 서로 맞는지 서버가 판정한 결과다.

// 문제 종류. 앞의 다섯은 계산을 막는 오류, 다음 넷은 확인이 필요한 경고, 마지막은 참고다.
export type CatalogProblemCode =
  | "UNKNOWN_SUB_PRODUCT"
  | "CIRCULAR_RECIPE"
  | "MISSING_PRICE"
  | "TOTAL_OVERFLOW"
  | "BLOCKED_BY_SUB_PRODUCT"
  | "MISSING_RESULT"
  | "STALE_RESULT"
  | "NAME_CONFLICT"
  | "REQUIRED_PRODUCT_MISSING"
  | "UNUSED_MARKET";

export type CatalogSeverity = "error" | "warning" | "info";

// 키는 항상 모두 있고, 해당 없으면 null이나 []다
export interface CatalogProblem {
  code: CatalogProblemCode;
  severity: CatalogSeverity;
  productId: number | null;
  productName: string | null;
  // 문제가 된 재료 이름 또는 시세 이름
  material: string | null;
  marketId: number | null;
  // 순환이면 닫힌 경로(["A", "B", "A"]), 하위 물품 문제면 그 하위 물품들
  related: string[];
  hint: string | null;
  message: string;
}

// ok: 결과가 최신, missing: 계산할 수 있지만 결과 없음,
// stale: 저장된 결과가 현재 레시피·시세와 다름, error: 계산할 수 없음
export type ProductStatus = "ok" | "missing" | "stale" | "error";

export interface CatalogProductStatus {
  id: number;
  name: string;
  status: ProductStatus;
  resultId: number | null;
}

export interface CatalogMarketUsage {
  id: number;
  name: string;
  price: number;
  // 이 시세를 최하위재료로 직접 쓰는 물품 이름(물품 id 순)
  usedBy: string[];
}

export interface CatalogSummary {
  products: number;
  markets: number;
  // 저장된 결과 수
  results: number;
  errors: number;
  warnings: number;
  infos: number;
}

export interface CatalogCheck {
  summary: CatalogSummary;
  // 물품 id 순
  products: CatalogProductStatus[];
  // 시세 id 순
  markets: CatalogMarketUsage[];
  // severity → 종류 → 물품 순으로 서버가 정렬한다
  problems: CatalogProblem[];
}
