import { putMarkets } from "apis/market/putMarkets";
import { useMutation } from "react-query";

export const useMarketMutation = () =>
  useMutation({
    mutationFn: putMarkets,
  });
