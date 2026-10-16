import { client } from "@/apis/client";
import { ENDPOINTS } from "@/apis/endpoints";
import { Page } from "@/types/page";
import {
  CalculatorRequest,
  CalculatorResponse,
  Result,
  ResultSearchParams,
} from "@/types/result";

export async function fetchResults(params: ResultSearchParams) {
  const { data } = await client.get<Page<Result>>(ENDPOINTS.RESULT, {
    params,
  });
  return data;
}

// 결과가 아직 없는 물품의 결과를 서버에 저장된 시세로 새로 만든다 (관리자).
// 이미 모두 있으면 서버가 400("추가할 결과가 없습니다.")을 돌려준다.
export async function createResults() {
  await client.post(ENDPOINTS.RESULT);
}

// 사용자가 입력한 시세로 결과를 계산한다 (자유 모드, 서버에 저장하지 않음)
export async function calculateResults(body: CalculatorRequest) {
  const { data } = await client.post<CalculatorResponse>(
    ENDPOINTS.CALCULATOR,
    body
  );
  return data;
}
