import { putMarkets } from "apis/putMarkets";
import { useMutation } from "react-query";

export const useMarketMutation = () =>
  useMutation({
    mutationFn: putMarkets,
  });
