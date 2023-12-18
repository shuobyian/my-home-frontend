import API_URL from "apis/API_URL";
import myAxios from "apis/lib/myAxios";
import { Product } from "apis/product/getProducts";

export interface ProductReqBody {
  products: Product[];
}

export function postProducts(body: ProductReqBody) {
  return myAxios.post<Product[]>(API_URL.PRODUCT_ALL, body);
}
