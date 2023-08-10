import { useQuery } from "react-query";
import { getMarkets } from "../apis/getMarkets";

export const useMarketQuery = () =>
  useQuery({
    queryKey: ["market"],
    queryFn: () => getMarkets(),
    select: ({ data }) => data,
  });
