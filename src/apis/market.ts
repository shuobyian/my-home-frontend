import { client } from "@/apis/client";
import { ENDPOINTS } from "@/apis/endpoints";
import { Market } from "@/types/market";

export async function fetchMarkets() {
  const { data } = await client.get<Market[]>(ENDPOINTS.MARKET);
  return data;
}

export async function updateMarkets(body: Market[]) {
  await client.put(ENDPOINTS.MARKET, body);
}
