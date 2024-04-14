import API_URL from "apis/API_URL";
import myAxios from "apis/lib/myAxios";

export interface IExperience {
  id: number;
  level: number;
  amount: number;
}

export function getExperience() {
  return myAxios.get<IExperience[]>(API_URL.EXPERIENCE);
}
