import { client } from "@/apis/client";
import { ENDPOINTS } from "@/apis/endpoints";
import { Page } from "@/types/page";
import {
  CalculatorRequest,
  CalculatorResponse,
  Result,
  ResultRow,
  ResultSearchParams,
} from "@/types/result";

export async function fetchResults(params: ResultSearchParams) {
  const { data } = await client.get<Page<Result>>(ENDPOINTS.RESULT, {
    params,
  });
  return data;
}

// 결과 전체 동기화 (관리자). 빠진 결과를 만들고 낡은 결과를 현재 레시피·시세로 고친다.
// 계산할 수 없는 물품은 건너뛰고 항상 성공(201)한다. 응답은 이번에 새로 만든 결과 행이다(없으면 []).
export async function syncResults() {
  const { data } = await client.post<ResultRow[]>(ENDPOINTS.RESULT);
  return data;
}

// 사용자가 입력한 시세로 결과를 계산한다 (시세 조작 모드, 서버에 저장하지 않음)
export async function calculateResults(body: CalculatorRequest) {
  const { data } = await client.post<CalculatorResponse>(
    ENDPOINTS.CALCULATOR,
    body
  );
  return data;
}
