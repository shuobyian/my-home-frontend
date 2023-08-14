import API_URL from "apis/API_URL";
import myAxios from "apis/myAxios";

export interface Market {
  id: string;
  name: string;
  price: number;
}

export function getMarkets() {
  return myAxios.get<Market[]>(API_URL.MARKET);
}
