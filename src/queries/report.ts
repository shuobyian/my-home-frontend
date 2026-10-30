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

export const useReportsQuery = (params: ReportSearchParams) =>
  useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () => fetchReports(params),
    placeholderData: keepPreviousData,
  });

// 없는 제보(404)는 화면이 직접 안내한다
export const useReportQuery = (id: number) =>
  useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => fetchReport(id),
    throwOnError: false,
  });

// 저장한 제보로 상세 캐시를 바꾸고 목록은 다시 받는다. 쓰기는 로그에도 남으므로 로그도 다시 받는다
function useSaveReport<T>(mutationFn: (input: T) => Promise<Report>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (report) => {
      queryClient.setQueryData(reportKeys.detail(report.id), report);
      queryClient.invalidateQueries({ queryKey: reportKeys.lists });
      queryClient.invalidateQueries({ queryKey: logKeys.all });
    },
  });
}

export const useCreateReportMutation = () =>
  useSaveReport((body: ReportInput) => createReport(body));

export const useUpdateReportMutation = (id: number) =>
  useSaveReport((body: ReportInput) => updateReport(id, body));

export const useAnswerReportMutation = (id: number) =>
  useSaveReport((body: ReportAnswerInput) => answerReport(id, body));

export const useDeleteReportMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteReport(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: reportKeys.detail(id) });
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
