import { useQuery } from "react-query";
import { ResultReqParams, getResults } from "../apis/getResults";

export const useResultQuery = (params: ResultReqParams) =>
  useQuery({
    queryKey: ["result", params],
    queryFn: () => getResults(params),
    select: ({ data }) => data,
  });
