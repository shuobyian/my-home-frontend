import API_URL from "apis/API_URL";
import myAxios from "apis/lib/myAxios";
import { Tool } from "apis/type/Tool";

export interface ItemReqParams {
  page: number;
  size: number;
}

export interface RawItem {
  id: number;
  name: string;
  level: number;
  craftingPrice: number;
  tool: Tool;
  name1: string;
  base1: number;
  count1: number;
  name2?: string;
  base2?: number;
  count2?: number;
  name3?: string;
  base3?: number;
  count3?: number;
  name4?: string;
  base4?: number;
  count4?: number;
  name5?: string;
  base5?: number;
  count5?: number;
}

export interface Item {
  id: number;
  name: string;
  level: number;
  craftingPrice: number;
  tool: Tool;
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
