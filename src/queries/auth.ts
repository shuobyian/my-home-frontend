import { login, logout, signup, updateProfile } from "@/apis/auth";
import {
  clearAuthSession,
  saveAuthSession,
  saveSessionUser,
} from "@/lib/authSession";
import { Credentials, ProfileInput, SignupInput } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";

// 성공하면 세션을 저장한다. 화면은 state/auth의 useCurrentUser로 바로 반영된다.
// v5는 두 번째 인자로 뮤테이션 컨텍스트를 넘기므로 API 함수에는 입력값만 전달한다.
export const useLoginMutation = () =>
  useMutation({
    mutationFn: (body: Credentials) => login(body),
    onSuccess: (session) => saveAuthSession(session),
  });

export const useSignupMutation = () =>
  useMutation({
    mutationFn: (body: SignupInput) => signup(body),
    onSuccess: (session) => saveAuthSession(session),
  });

// 저장한 세션의 회원 정보도 바꿔 메뉴의 닉네임이 바로 바뀐다
export const useUpdateProfileMutation = () =>
  useMutation({
    mutationFn: (body: ProfileInput) => updateProfile(body),
    onSuccess: (user) => saveSessionUser(user),
  });

// 서버 요청이 실패해도(네트워크 오류 등) 이 기기에서는 로그아웃한다.
// 그때 서버의 토큰은 만료될 때까지 남는다.
export const useLogoutMutation = () =>
  useMutation({
    mutationFn: () => logout().finally(clearAuthSession),
  });
