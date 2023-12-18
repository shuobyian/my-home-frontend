import API_URL from "apis/API_URL";
import myAxios from "apis/lib/myAxios";
import { Product } from "apis/product/getProducts";
import { Tool } from "apis/type/Tool";

export interface ProductReqBody {
  id: number;
  name: string;
  level: number;
  craftingPrice: number;
  tool: Tool;
  materials: {
    name: string;
    basic: boolean;
    count: number;
  }[];
}

export function putProduct(body: ProductReqBody) {
  return myAxios.put<Product[]>(API_URL.PRODUCT, body);
}
