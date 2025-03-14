import API_URL from "apis/API_URL";
import { Product } from "apis/product/getProducts";
import myAxios from "apis/lib/myAxios";
import { Tool } from "apis/type/Tool";
import { Category } from "apis/type/Category";

export interface ResultReqParams {
  page: number;
  size: number;
  name?: string;
  count?: number;
  tool?: Tool;
  category?: Category;
}

export interface Result {
  id: number;
  createdAt: string;
  product: Product;
  name: string;
  level: number;
  craftingPrice: number;
  materials: {
    name: string;
    count: number;
    price: number;
  }[];
  totalPrice: number;
}

export interface ItemGetResponseBody {
  content: Result[];
  totalElements: number;
}

export function getResults(params: ResultReqParams) {
  return myAxios.get<ItemGetResponseBody>(API_URL.RESULT, { params });
}
