import { useMutation } from "react-query";
import { postLogin } from "../apis/getLogin";

export const useLoginMutation = () =>
  useMutation({
    mutationFn: postLogin,
  });
