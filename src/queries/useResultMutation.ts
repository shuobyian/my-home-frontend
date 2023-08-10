import { useMutation } from "react-query";
import { postResult } from "../apis/postResult";

export const useResultMutation = () =>
  useMutation({
    mutationFn: postResult,
  });
