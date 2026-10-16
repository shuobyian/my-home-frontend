import { login } from "apis/auth";
import { useMutation } from "react-query";

export const useLoginMutation = () =>
  useMutation({
    mutationFn: login,
  });
