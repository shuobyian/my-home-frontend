import {
  CatalogCheck,
  CatalogProblemCode,
  CatalogSeverity,
  ProductStatus,
} from "@/types/catalog";
import { Product, ProductMaterial } from "@/types/product";

// 재료 이름을 맞춰 볼 시세 이름과 물품 이름
export interface CatalogNames {
  markets: ReadonlySet<string>;
  products: ReadonlySet<string>;
}

export function toCatalogNames(check: CatalogCheck): CatalogNames {
  return {
    markets: new Set(check.markets.map(({ name }) => name)),
    products: new Set(check.products.map(({ name }) => name)),
  };
}

// 재료 한 줄이 가리키는 대상.
// 최하위재료(basic)는 시세를, 하위재료 O는 물품을 같은 이름으로 찾는다(서버 계산 규칙).
export type MaterialRef =
  // 가리키는 대상이 있다
  | "ok"
  // 최하위재료인데 시세에 없다(새 재료이거나 오타)
  | "missing-market"
  // 최하위재료인데 물품에만 있다
  | "product-as-basic"
  // 하위재료 O인데 물품이 없다
  | "unknown-product"
  // 하위재료 O인데 시세에만 있다
  | "market-as-sub"
  // 하위재료 O로 자기 자신을 가리킨다
  | "self"
  // 최하위재료로 시세를 가리키지만 같은 이름의 물품도 있다
  | "ambiguous";

// 재료 한 줄을 분류한다. 이름이 비었거나 하위재료 여부를 고르지 않았으면 undefined.
// selfName은 지금 편집 중인 물품의 이름이다.
export function classifyMaterial(
  { name, basic }: { name?: string; basic?: boolean },
  names: CatalogNames,
  selfName?: string
): MaterialRef | undefined {
  const target = name?.trim();
  if (!target || basic === undefined) return undefined;
  const isMarket = names.markets.has(target);
  const isProduct = names.products.has(target);
  if (basic) {
    if (isMarket) return isProduct ? "ambiguous" : "ok";
    return isProduct ? "product-as-basic" : "missing-market";
  }
  if (target === selfName?.trim()) return "self";
  if (isProduct) return "ok";
  return isMarket ? "market-as-sub" : "unknown-product";
}

// 손봐야 하거나 확인할 참조("ok"가 아닌 것)
export type MaterialRefIssue = Exclude<MaterialRef, "ok">;

export const MATERIAL_REF_TEXT: Record<MaterialRefIssue, string> = {
  "missing-market": "시세에 없는 새 재료입니다.",
  "product-as-basic": "물품 이름입니다. '하위재료 O'로 바꾸세요.",
  "unknown-product": "없는 물품입니다.",
  "market-as-sub": "시세 재료 이름입니다. '최하위재료'로 바꾸세요.",
  self: "자기 자신을 재료로 쓸 수 없습니다.",
  ambiguous:
    "같은 이름의 물품도 있습니다. 물품을 재료로 쓰려면 '하위재료 O'로 바꾸세요.",
};

// 서버가 저장을 거절하는 참조. 시세 없는 새 재료(missing-market)는 시세를 먼저 추가하면 저장할 수 있다.
export const BLOCKING_REFS: readonly MaterialRefIssue[] = [
  "product-as-basic",
  "unknown-product",
  "market-as-sub",
  "self",
];

export const isBlockingRef = (
  ref: MaterialRef | undefined
): ref is MaterialRefIssue =>
  BLOCKING_REFS.some((blocking) => blocking === ref);

// 이름만으로 하위재료 여부를 정할 수 있으면 정한다(물품에만 있으면 false, 시세에만 있으면 true)
export function inferBasic(
  name: string | undefined,
  names: CatalogNames
): boolean | undefined {
  const target = name?.trim();
  if (!target) return undefined;
  const isMarket = names.markets.has(target);
  const isProduct = names.products.has(target);
  if (isProduct && !isMarket) return false;
  if (isMarket && !isProduct) return true;
  return undefined;
}

// Record로 정의해 문제 종류가 추가되면 라벨 누락을 컴파일 시점에 잡는다
export const PROBLEM_CODE_LABELS: Record<CatalogProblemCode, string> = {
  UNKNOWN_SUB_PRODUCT: "없는 하위 물품",
  MISSING_PRICE: "시세 없는 재료",
  CIRCULAR_RECIPE: "순환 참조",
  TOTAL_OVERFLOW: "합계 초과",
  BLOCKED_BY_SUB_PRODUCT: "하위 물품 문제",
  MISSING_RESULT: "결과 없음",
  STALE_RESULT: "결과 낡음",
  NAME_CONFLICT: "이름 겹침",
  REQUIRED_PRODUCT_MISSING: "호두작 물품 없음",
  UNUSED_MARKET: "쓰지 않는 시세",
};

export const SEVERITY_LABELS: Record<CatalogSeverity, string> = {
  error: "오류",
  warning: "확인 필요",
  info: "참고",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ok: "정상",
  missing: "결과 없음",
  stale: "결과 낡음",
  error: "계산 불가",
};

export interface ProductCheckStatus {
  status: ProductStatus;
  // 그 물품의 오류·경고 문구(서버 정렬 순서)
  messages: string[];
}

// 물품 id별 상태와 문제 문구
export function statusByProductId(
  check: CatalogCheck
): Map<number, ProductCheckStatus> {
  const messages = new Map<number, string[]>();
  check.problems.forEach(({ productId, severity, message }) => {
    if (productId === null || severity === "info") return;
    messages.set(productId, [...(messages.get(productId) ?? []), message]);
  });
  return new Map(
    check.products.map(({ id, status }) => [
      id,
      { status, messages: messages.get(id) ?? [] },
    ])
  );
}

export interface UploadProblems {
  // 시세에 없는 최하위재료와 그것을 쓰는 업로드 물품(처음 나온 순서)
  missingMarkets: { name: string; usedBy: string[] }[];
  // 서버가 거절할 참조(BLOCKING_REFS)
  rowProblems: { product: string; material: string; ref: MaterialRefIssue }[];
}

// 일괄 업로드할 물품의 재료 참조를 검사한다.
// 같은 업로드 안의 물품을 하위재료로 쓸 수 있도록 names.products에는 서버 이름과 업로드 이름을 함께 넣는다.
export function findUploadProblems(
  rows: readonly Pick<Product, "name" | "materials">[],
  names: CatalogNames
): UploadProblems {
  const usedByMarket = new Map<string, string[]>();
  const rowProblems: UploadProblems["rowProblems"] = [];

  rows.forEach(({ name, materials }) => {
    const product = name.trim();
    materials.forEach((material: ProductMaterial) => {
      const ref = classifyMaterial(material, names, product);
      const materialName = material.name.trim();
      if (ref === "missing-market") {
        const usedBy = usedByMarket.get(materialName) ?? [];
        if (!usedBy.includes(product)) usedBy.push(product);
        usedByMarket.set(materialName, usedBy);
      } else if (isBlockingRef(ref)) {
        rowProblems.push({ product, material: materialName, ref });
      }
    });
  });

  return {
    missingMarkets: [...usedByMarket].map(([name, usedBy]) => ({
      name,
      usedBy,
    })),
    rowProblems,
  };
}

// 저장해 둔 이름 목록을 복원한다. 형태가 맞지 않으면 undefined.
export function parseNameList(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((name) => typeof name === "string")
    ? value
    : undefined;
}
