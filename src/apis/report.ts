import { client } from "@/apis/client";
import { ENDPOINTS } from "@/apis/endpoints";
import { Page } from "@/types/page";
import {
  ActivityLog,
  ActivityLogSearchParams,
  Report,
  ReportAnswerInput,
  ReportInput,
  ReportSearchParams,
} from "@/types/report";

const reportPath = (id: number) => `${ENDPOINTS.REPORT}/${id}`;

// 제보 목록(최근 것부터)과 상세는 누구나 본다
export async function fetchReports(params: ReportSearchParams) {
  const { data } = await client.get<Page<Report>>(ENDPOINTS.REPORT, {
    params,
  });
  return data;
}

// 없으면 404
export async function fetchReport(id: number) {
  const { data } = await client.get<Report>(reportPath(id));
  return data;
}

// 로그인한 회원만 쓴다. 바꿀 값은 서버가 현재 값과 비교해 검사한다(없는 대상·같은 값은 400)
export async function createReport(body: ReportInput) {
  const { data } = await client.post<Report>(ENDPOINTS.REPORT, body);
  return data;
}

// 쓴 사람이 접수 상태일 때만 고친다(아니면 403)
export async function updateReport(id: number, body: ReportInput) {
  const { data } = await client.put<Report>(reportPath(id), body);
  return data;
}

// 관리자 처리(상태·답변)
export async function answerReport(id: number, body: ReportAnswerInput) {
  const { data } = await client.patch<Report>(reportPath(id), body);
  return data;
}

// 쓴 사람은 접수 상태일 때만, 관리자는 언제든 지운다
export async function deleteReport(id: number) {
  await client.delete(reportPath(id));
}

// 활동 로그(최근 것부터, 관리자)
export async function fetchActivityLogs(params: ActivityLogSearchParams) {
  const { data } = await client.get<Page<ActivityLog>>(ENDPOINTS.LOG, {
    params,
  });
  return data;
}
