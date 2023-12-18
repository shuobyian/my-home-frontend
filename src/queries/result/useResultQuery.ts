import { ResultReqParams, getResults } from "apis/result/getResults";
import { useQuery } from "react-query";

export const useResultQuery = (params: ResultReqParams) =>
  useQuery({
    queryKey: ["result", params],
    queryFn: () => getResults(params),
    select: ({ data }) => ({
      ...data,
      content: data.content.map((c) => ({
        ...c,
        materials: c.materials.sort((a, b) => (a.name > b.name ? 1 : -1)),
      })),
    }),
  });
