import API_URL from "apis/API_URL";
import myAxios from "apis/lib/myAxios";
import { Category } from "apis/type/Category";
import { Tool } from "apis/type/Tool";

export interface ProductReqParams {
  page: number;
  size: number;
}

export interface Product {
  id: number;
  name: string;
  level: number;
  craftingPrice: number;
  tool: Tool;
  category: Category;
  materials: {
    name: string;
    basic: boolean;
    count: number;
  }[];
}

export interface IProductGetResponseBody {
  content: Product[];
  totalElements: number;
}

export function getProducts(params: ProductReqParams) {
  return myAxios.get<IProductGetResponseBody>(API_URL.PRODUCT, { params });
}
