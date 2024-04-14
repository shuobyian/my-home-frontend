import { WalnutReqParams, getWalnut } from "apis/experience/postWalnut";
import { useMutation } from "react-query";

export const useWalnutMutation = () =>
  useMutation({
    mutationFn: (params: WalnutReqParams) => getWalnut(params),
  });
