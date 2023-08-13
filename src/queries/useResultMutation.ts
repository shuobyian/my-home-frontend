import { postResult } from "apis/postResult";
import { useMutation } from "react-query";

export const useResultMutation = () =>
  useMutation({
    mutationFn: postResult,
  });
