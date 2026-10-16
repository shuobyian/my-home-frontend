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

// 서버에 저장된 물품과 시세로 결과 리스트를 다시 생성한다 (관리자)
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
