import { ResultReqParams, getResults } from "apis/getResults";
import { useQuery } from "react-query";

export const useResultQuery = (params: ResultReqParams) =>
  useQuery({
    queryKey: ["result", params],
    queryFn: () => getResults(params),
    select: ({ data }) => ({
      ...data,
      content: data.content.map((c) => ({
        ...c,
      })),
    }),
  });
