import { useMutation } from "react-query";
import { putMarkets } from "../apis/putMarkets";

export const useMarketMutation = () =>
  useMutation({
    mutationFn: putMarkets,
  });
