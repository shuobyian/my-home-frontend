import { Category, Tool } from "@/types/enums";
import { Market } from "@/types/market";
import { Product } from "@/types/product";

// 기초 재료와 그 가격(시세 × 개수)
export interface MaterialCost {
  name: string;
  count: number;
  price: number;
}

// 서버가 기초 재료까지 펼쳐 시세를 적용한 계산 결과
export interface Result {
  id: number;
  createdAt: string;
  product: Product;
  name: string;
  level: number;
  // 물품의 tool·category를 복사한 값
  tool: Tool;
  category: Category;
  craftingPrice: number;
  materials: MaterialCost[];
  totalPrice: number;
}

// 저장된 결과 행 그대로(POST /result 응답). 재료 이름·개수·가격은 쉼표로 이은 문자열이다
export interface ResultRow {
  id: number;
  createdAt: string;
  updatedAt: string | null;
  product_id: number;
  names: string;
  counts: string;
  prices: string;
  totalPrice: number;
}

export interface ResultSearchParams {
  page: number;
  size: number;
  name?: string;
  tool?: Tool;
  category?: Category;
}

export interface CalculatorRequest {
  markets: Market[];
}

export interface CalculatorResponse {
  results: Result[];
}
