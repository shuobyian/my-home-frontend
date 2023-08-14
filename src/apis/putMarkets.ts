import API_URL from "apis/API_URL";
import myAxios from "apis/myAxios";

export interface Market {
  id: string;
  name: string;
  price: number;
}

export function putMarkets(body: Market[]) {
  return myAxios.put(API_URL.MARKET, body);
}
