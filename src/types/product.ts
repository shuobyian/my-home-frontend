import { Category, Tool } from "@/types/enums";

// 물품의 직속 재료
export interface ProductMaterial {
  // 서버가 준 재료에만 있다(엑셀·입력 폼에서 만든 재료에는 없다). 물품을 수정하면 바뀐다
  id?: number;
  name: string;
  // true: 최하위재료, false: 하위재료가 있는 재료
  basic: boolean;
  count: number;
}

// 제작 물품(레시피)
export interface Product {
  id: number;
  name: string;
  level: number;
  craftingPrice: number;
  tool: Tool;
  category: Category;
  materials: ProductMaterial[];
}

export interface ProductSearchParams {
  page: number;
  size: number;
  name?: string;
}

export type ProductCreateRequest = Omit<Product, "id">;

export type ProductUpdateRequest = Product;

// 서버는 id를 무시하고, 이미 있는 이름의 물품은 건너뛴다(추가만 한다)
export interface ProductBulkCreateRequest {
  products: ProductCreateRequest[];
}

export interface ProductDeleteRequest {
  ids: number[];
}
