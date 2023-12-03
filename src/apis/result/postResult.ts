import API_URL from "apis/API_URL";
import myAxios from "apis/lib/myAxios";

export function postResult() {
  return myAxios.post(API_URL.RESULT);
}
