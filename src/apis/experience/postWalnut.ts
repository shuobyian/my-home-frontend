import API_URL from "apis/API_URL";
import myAxios from "apis/lib/myAxios";
import { Result } from "apis/result/getResults";

export interface WalnutReqParams {
  presentLevel: number;
  presentExperience?: number;
  objectiveLevel?: number;
  productionPercent?: number;
}

export interface WalnutResBody {
  remindExperience: number;
  remindCount: number;
  ample: { result: Result };
}

export function getWalnut(params: WalnutReqParams) {
  return myAxios.get<WalnutResBody>(API_URL.WALNUT, { params });
}
