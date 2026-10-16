import { calculateResults, createResults, fetchResults } from "apis/result";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Page } from "types/page";
import {
  CalculatorRequest,
  CalculatorResponse,
  Result,
  ResultSearchParams,
} from "types/result";

export const resultKeys = {
  all: ["result"] as const,
  list: (params: ResultSearchParams) =>
    [...resultKeys.all, "list", params] as const,
};

export const calculatorKeys = {
  all: ["calculator"] as const,
  result: (body: CalculatorRequest) => [...calculatorKeys.all, body] as const,
};

// 캐시 원본을 바꾸지 않도록 복사본을 정렬한다
const sortMaterialsByName = (result: Result): Result => ({
  ...result,
  materials: [...result.materials].sort((a, b) => (a.name > b.name ? 1 : -1)),
});

// select는 렌더마다 다시 실행되지 않도록 모듈 수준에서 정의한다
const selectSortedPage = (page: Page<Result>): Page<Result> => ({
  ...page,
  content: page.content.map(sortMaterialsByName),
});

const selectResults = (response: CalculatorResponse) => response.results;

export const useResultsQuery = (params: ResultSearchParams) =>
  useQuery({
    queryKey: resultKeys.list(params),
    queryFn: () => fetchResults(params),
    select: selectSortedPage,
    // 페이지·검색 조건이 바뀌는 동안 이전 목록을 유지해 깜빡임을 없앤다
    keepPreviousData: true,
  });

export const useCreateResultsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createResults,
    onSuccess: () => {
      queryClient.invalidateQueries(resultKeys.all);
    },
  });
};

export const useCalculateResultsQuery = (
  body: CalculatorRequest,
  { enabled = true }: { enabled?: boolean } = {}
) =>
  useQuery({
    queryKey: calculatorKeys.result(body),
    queryFn: () => calculateResults(body),
    select: selectResults,
    enabled,
    // 화면에서 isError를 직접 처리하므로 ErrorBoundary로 던지지 않는다
    useErrorBoundary: false,
  });
