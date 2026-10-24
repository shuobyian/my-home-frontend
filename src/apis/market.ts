import { client } from "@/apis/client";
import { ENDPOINTS } from "@/apis/endpoints";
import {
  Market,
  MarketDeleteRequest,
  MarketDeleteResponse,
  MarketUpdateItem,
} from "@/types/market";

export async function fetchMarkets() {
  const { data } = await client.get<Market[]>(ENDPOINTS.MARKET);
  return data;
}

// 시세를 고치고 새 시세를 추가한다 (관리자). 응답은 요청 순서의 저장된 시세다.
// 서버는 이름 변경을 그 재료를 쓰는 물품 레시피에 전파하고 결과를 다시 계산한다.
export async function updateMarkets(body: MarketUpdateItem[]) {
  const { data } = await client.put<Market[]>(ENDPOINTS.MARKET, body);
  return data;
}

// 쓰는 물품이 없는 시세만 지울 수 있다 (관리자). 하나라도 쓰이면 아무것도 지우지 않고 400이다.
export async function deleteMarkets(body: MarketDeleteRequest) {
  const { data } = await client.delete<MarketDeleteResponse>(ENDPOINTS.MARKET, {
    data: body,
  });
  return data;
}
