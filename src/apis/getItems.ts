import API_URL from "./API_URL";
import myAxios from "./myAxios";

export interface Item {
  itemId: number;
  name: string;
  level: number;
  craftingPrice: number;
  materials: {
    name: string;
    base: boolean;
    count: number;
  }[];
}

// export interface ItemGetResponseBody {}

export function getItems() {
  return myAxios.get<Item[]>(API_URL.ITEM);
}
