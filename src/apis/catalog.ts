import { client } from "@/apis/client";
import { ENDPOINTS } from "@/apis/endpoints";
import { CatalogCheck } from "@/types/catalog";

// 시세·물품·결과가 서로 맞는지 서버가 점검한다 (관리자, 저장하지 않음)
export async function fetchCatalogCheck() {
  const { data } = await client.get<CatalogCheck>(ENDPOINTS.CATALOG_CHECK);
  return data;
}
