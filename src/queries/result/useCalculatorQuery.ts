import { CalculatorReqBody, postCalculator } from "apis/result/postCalculator";
import { useQuery } from "react-query";

export const useCalculatorQuery = (
  body: CalculatorReqBody,
  { enabled = true }: { enabled?: boolean } = {}
) =>
  useQuery({
    queryKey: ["result", "calculator", body],
    queryFn: () => postCalculator(body),
    select: ({ data }) => data.results,
    enabled,
    // 화면에서 isError를 직접 처리하므로 ErrorBoundary로 던지지 않는다
    useErrorBoundary: false,
  });
