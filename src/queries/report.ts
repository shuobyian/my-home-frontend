import {
  answerReport,
  createReport,
  deleteReport,
  fetchActivityLogs,
  fetchReport,
  fetchReports,
  updateReport,
} from "@/apis/report";
import { logKeys, reportKeys } from "@/queries/keys";
import {
  ActivityLogSearchParams,
  Report,
  ReportAnswerInput,
  ReportInput,
  ReportSearchParams,
} from "@/types/report";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// 로그인한 회원만 받는다. 관리자는 모든 제보, 회원은 자기 제보만 온다
export const useReportsQuery = (
  userId: number | undefined,
  params: ReportSearchParams
) =>
  useQuery({
    queryKey: reportKeys.list(userId, params),
    queryFn: () => fetchReports(params),
    enabled: userId !== undefined,
    placeholderData: keepPreviousData,
  });

// 없는 제보(404, 남의 제보도 같다)는 화면이 직접 안내한다
export const useReportQuery = (userId: number | undefined, id: number) =>
  useQuery({
    queryKey: reportKeys.detail(userId, id),
    queryFn: () => fetchReport(id),
    enabled: userId !== undefined,
    throwOnError: false,
  });

// 저장한 제보로 상세 캐시를 바꾸고 목록은 다시 받는다. 쓰기는 로그에도 남으므로 로그도 다시 받는다
function useSaveReport<T>(
  userId: number,
  mutationFn: (input: T) => Promise<Report>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (report) => {
      queryClient.setQueryData(reportKeys.detail(userId, report.id), report);
      queryClient.invalidateQueries({ queryKey: reportKeys.lists });
      queryClient.invalidateQueries({ queryKey: logKeys.all });
    },
  });
}

export const useCreateReportMutation = (userId: number) =>
  useSaveReport(userId, (body: ReportInput) => createReport(body));

export const useUpdateReportMutation = (userId: number, id: number) =>
  useSaveReport(userId, (body: ReportInput) => updateReport(id, body));

export const useAnswerReportMutation = (userId: number, id: number) =>
  useSaveReport(userId, (body: ReportAnswerInput) => answerReport(id, body));

export const useDeleteReportMutation = (userId: number, id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteReport(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: reportKeys.detail(userId, id) });
      queryClient.invalidateQueries({ queryKey: reportKeys.lists });
      queryClient.invalidateQueries({ queryKey: logKeys.all });
    },
  });
};

export const useActivityLogsQuery = (params: ActivityLogSearchParams) =>
  useQuery({
    queryKey: logKeys.list(params),
    queryFn: () => fetchActivityLogs(params),
    placeholderData: keepPreviousData,
  });
