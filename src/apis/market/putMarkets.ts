import API_URL from "apis/API_URL";
import myAxios from "apis/lib/myAxios";

export interface IMarket {
  id: string;
  name: string;
  price: number;
}

export function putMarkets(body: IMarket[]) {
  return myAxios.put(API_URL.MARKET, body);
}
