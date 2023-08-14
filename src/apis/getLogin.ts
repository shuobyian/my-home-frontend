import API_URL from "apis/API_URL";
import myAxios from "apis/myAxios";

export function postLogin(password: string) {
  return myAxios.post(API_URL.LOGIN, { password });
}
