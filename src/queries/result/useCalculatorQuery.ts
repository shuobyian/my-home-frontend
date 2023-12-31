import { CalculatorReqBody, postCalculator } from "apis/result/postCalculator";
import { useQuery } from "react-query";

export const useCalculatorQuery = (body: CalculatorReqBody) =>
  useQuery({
    queryKey: ["result", "calculator", body],
    queryFn: () => postCalculator(body),
    select: ({ data }) => data.results,
  });
