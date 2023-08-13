import { postLogin } from "apis/getLogin";
import { useMutation } from "react-query";

export const useLoginMutation = () =>
  useMutation({
    mutationFn: postLogin,
  });
