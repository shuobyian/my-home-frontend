import API_URL from "apis/API_URL";
import myAxios from "apis/myAxios";

interface ItemGetRequestBody {
  name: string;
  level: number;
  craftingPrice: number;
  materials: {
    name: string;
    base: boolean;
    count: number;
  }[];
}

export function postItem(body: ItemGetRequestBody) {
  return myAxios.post(API_URL.ITEM, body);
}
