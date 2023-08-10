import API_URL from "./API_URL";
import myAxios from "./myAxios";

export interface Market {
  id: string;
  name: string;
  price: number;
}

export function getMarkets() {
  return myAxios.get<Market[]>(API_URL.MARKET);
}
