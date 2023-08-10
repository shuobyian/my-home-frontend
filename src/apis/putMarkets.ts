import API_URL from "./API_URL";
import myAxios from "./myAxios";

export interface Market {
  id: string;
  name: string;
  price: number;
}

export function putMarkets(body: Market[]) {
  return myAxios.put(API_URL.MARKET, body);
}
