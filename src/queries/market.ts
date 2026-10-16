import { fetchMarkets, updateMarkets } from "apis/market";
import { useMutation, useQuery, useQueryClient } from "react-query";

export const marketKeys = {
  all: ["market"] as const,
};

export const useMarketsQuery = () =>
  useQuery({
    queryKey: marketKeys.all,
    queryFn: fetchMarkets,
  });

export const useUpdateMarketsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMarkets,
    onSuccess: () => {
      queryClient.invalidateQueries(marketKeys.all);
    },
  });
};
