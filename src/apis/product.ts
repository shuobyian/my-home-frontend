import { client } from "apis/client";
import { ENDPOINTS } from "apis/endpoints";
import { Page } from "types/page";
import {
  Product,
  ProductBulkCreateRequest,
  ProductCreateRequest,
  ProductDeleteRequest,
  ProductSearchParams,
  ProductUpdateRequest,
} from "types/product";

export async function fetchProducts(params: ProductSearchParams) {
  const { data } = await client.get<Page<Product>>(ENDPOINTS.PRODUCT, {
    params,
  });
  return data;
}

export async function createProduct(body: ProductCreateRequest) {
  const { data } = await client.post<Product>(ENDPOINTS.PRODUCT, body);
  return data;
}

export async function createProducts(body: ProductBulkCreateRequest) {
  const { data } = await client.post<Product[]>(ENDPOINTS.PRODUCT_ALL, body);
  return data;
}

export async function updateProduct(body: ProductUpdateRequest) {
  const { data } = await client.put<Product>(ENDPOINTS.PRODUCT, body);
  return data;
}

export async function deleteProducts(body: ProductDeleteRequest) {
  await client.delete(ENDPOINTS.PRODUCT, { data: body });
}
