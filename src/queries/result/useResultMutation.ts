import { postResult } from "apis/result/postResult";
import { useMutation } from "react-query";

export const useResultMutation = () =>
  useMutation({
    mutationFn: postResult,
  });
