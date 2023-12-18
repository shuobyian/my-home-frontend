import { postLogin } from "apis/product/getLogin";
import { useMutation } from "react-query";

export const useLoginMutation = () =>
  useMutation({
    mutationFn: postLogin,
  });
