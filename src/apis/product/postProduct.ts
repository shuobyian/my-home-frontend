import API_URL from "apis/API_URL";
import myAxios from "apis/lib/myAxios";
import { Product } from "apis/product/getProducts";
import { Category } from "apis/type/Category";
import { Tool } from "apis/type/Tool";

export interface ProductReqBody {
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

export function postProduct(body: ProductReqBody) {
  return myAxios.post<Product>(API_URL.PRODUCT, body);
}
