import { getMarkets } from "apis/getMarkets";
import { useQuery } from "react-query";

export const useMarketQuery = () =>
  useQuery({
    queryKey: ["market"],
    queryFn: () => getMarkets(),
    select: ({ data }) => data,
  });
