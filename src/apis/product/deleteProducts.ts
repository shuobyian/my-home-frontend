import API_URL from "apis/API_URL";
import myAxios from "apis/lib/myAxios";
import { Product } from "apis/product/getProducts";

export interface ProductReqBody {
  ids: number[];
}

export function deleteProducts(body: ProductReqBody) {
  return myAxios.delete<Product>(API_URL.PRODUCT, { data: body });
}
