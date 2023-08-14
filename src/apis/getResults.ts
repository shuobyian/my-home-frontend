import API_URL from "apis/API_URL";
import { Item } from "apis/getItems";
import myAxios from "apis/myAxios";

export interface ResultReqParams {
  page: number;
  size: number;
  name?: string;
  count?: number;
}

export interface Result {
  resultId: number;
  createdAt: string;
  item: Item;
  name: string;
  level: number;
  craftingPrice: number;
  basic: {
    name: string;
    count: number;
    price: number;
  }[];
  totalPrice: number;
}

export interface ItemGetResponseBody {
  content: Result[];
  totalElements: number;
}

export function getResults(params: ResultReqParams) {
  return myAxios.get<ItemGetResponseBody>(API_URL.RESULT, { params });
}
