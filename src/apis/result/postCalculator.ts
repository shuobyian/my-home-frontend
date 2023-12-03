import API_URL from "apis/API_URL";
import { Result } from "apis/result/getResults";
import myAxios from "apis/lib/myAxios";
import { IMarket } from "apis/putMarkets";

export interface CalculatorReqBody {
  markets: IMarket[];
}

export interface CalculatorResBody {
  results: Result[];
}

export function postCalculator(body: CalculatorReqBody) {
  return myAxios.post<CalculatorResBody>(API_URL.CALCULATOR, body);
}
