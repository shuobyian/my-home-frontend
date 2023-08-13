import { ResultReqParams, getResults } from "apis/getResults";
import { differenceInDays } from "date-fns";
import { useQuery } from "react-query";

export const useResultQuery = (params: ResultReqParams) =>
  useQuery({
    queryKey: ["result", params],
    queryFn: () => getResults(params),
    select: ({ data }) => ({
      ...data,
      content: data.content.map((c) => ({
        ...c,
        isNew: differenceInDays(new Date(c.createdAt), new Date()) < 7,
      })),
    }),
  });
