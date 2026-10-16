import { login } from "apis/auth";
import { useMutation } from "@tanstack/react-query";

export const useLoginMutation = () =>
  useMutation({
    // v5는 두 번째 인자로 뮤테이션 컨텍스트를 넘기므로 API 함수에는 비밀번호만 전달한다
    mutationFn: (password: string) => login(password),
  });
