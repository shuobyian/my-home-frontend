import API_URL from "apis/API_URL";
import myAxios from "apis/myAxios";

export interface ItemReqParams {
  page: number;
  size: number;
}

export interface Item {
  id: number;
  name: string;
  level: number;
  craftingPrice: number;
  materials: {
    name: string;
    base: boolean;
    count: number;
  }[];
}

export interface ItemGetResponseBody {
  content: Item[];
  totalElements: number;
}

export function getItems(params: ItemReqParams) {
  return myAxios.get<ItemGetResponseBody>(API_URL.ITEM, { params });
}
