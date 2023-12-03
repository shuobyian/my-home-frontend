import API_URL from "apis/API_URL";
import { Item } from "apis/getItems";
import myAxios from "apis/lib/myAxios";
import { Result } from "apis/result/getResults";

export interface UploadItemReqBody {
  items: Omit<Item, "id">[];
}

export function postUploadItem(body: UploadItemReqBody) {
  return myAxios.post<Result[]>(API_URL.UPLOAD_ITEM, body);
}
