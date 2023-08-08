import API_URL from "./API_URL";
import myAxios from "./myAxios";

export function postResult() {
  return myAxios.post(API_URL.RESULT);
}
