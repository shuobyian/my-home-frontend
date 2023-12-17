import { getMarkets } from "apis/market/getMarkets";
import { useQuery } from "react-query";

export const useMarketQuery = () =>
  useQuery({
    queryKey: ["market"],
    queryFn: () => getMarkets(),
    select: ({ data }) => data,
  });
