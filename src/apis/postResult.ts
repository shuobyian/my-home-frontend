import API_URL from "apis/API_URL";
import myAxios from "apis/myAxios";

export function postResult() {
  return myAxios.post(API_URL.RESULT);
}
