import API_URL from "./API_URL";
import myAxios from "./myAxios";

export function postLogin(password: string) {
  return myAxios.post(API_URL.LOGIN, { password });
}
