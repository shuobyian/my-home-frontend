import { ROUTES } from "@/app/routes";
import { AuthForm, AuthMode } from "@/components/auth/AuthForm";
import { Panel } from "@/components/common/Panel";
import { useLoginMutation, useSignupMutation } from "@/queries/auth";
import { useCurrentUser } from "@/state/auth";
import { Link, Navigate, useLocation } from "react-router";
import { Paragraph, Title } from "@/ui";

const TEXT = {
  login: {
    title: "로그인",
    switchPrompt: "계정이 없으신가요?",
    switchLabel: "회원가입",
    switchTo: ROUTES.SIGNUP,
  },
  signup: {
    title: "회원가입",
    switchPrompt: "이미 계정이 있으신가요?",
    switchLabel: "로그인",
    switchTo: ROUTES.LOGIN,
  },
};

// 로그인 전에 보던 화면. 관리 화면 게이트·헤더가 state.from(주소)과 state.fromState(그 화면의 state)로 넘긴다.
// 앱 안의 경로만 받는다.
function returnTo(state: unknown) {
  const { from, fromState } = (state ?? {}) as {
    from?: unknown;
    fromState?: unknown;
  };
  return typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//")
    ? { path: from, state: fromState }
    : { path: ROUTES.HOME };
}

// 로그인·회원가입 화면. 로그인되면(이미 로그인돼 있어도) 보던 화면으로 돌아간다.
// 두 경로가 같은 AuthPage를 다시 쓰므로, mode가 바뀌면 새로 그려 입력과 지난 서버 오류를 지운다.
export function AuthPage({ mode }: { mode: AuthMode }) {
  return <AuthScreen key={mode} mode={mode} />;
}

function AuthScreen({ mode }: { mode: AuthMode }) {
  const user = useCurrentUser();
  const { state } = useLocation();
  const login = useLoginMutation();
  const signup = useSignupMutation();
  const { mutate, isPending, error } = mode === "login" ? login : signup;
  const text = TEXT[mode];

  if (user) {
    const back = returnTo(state);
    return <Navigate to={back.path} state={back.state} replace />;
  }

  return (
    <Panel style={{ maxWidth: 420, margin: "40px auto" }}>
      <Title level={4}>{text.title}</Title>
      <AuthForm
        mode={mode}
        loading={isPending}
        error={error}
        onSubmit={(credentials) => mutate(credentials)}
      />
      <Paragraph style={{ margin: "var(--ui-space-4) 0 0" }}>
        {text.switchPrompt}{" "}
        {/* 돌아갈 화면(state)을 다른 쪽 화면으로 넘어가도 유지한다 */}
        <Link to={text.switchTo} state={state} replace>
          {text.switchLabel}
        </Link>
      </Paragraph>
    </Panel>
  );
}
