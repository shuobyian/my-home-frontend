import { getErrorMessage } from "@/apis/errors";
import { Credentials } from "@/types/auth";
import { Alert, Button, Field, Input, useForm } from "@/ui";

export type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (credentials: Credentials) => void;
  // 요청 중
  loading?: boolean;
  // 실패한 요청의 오류. 서버 메시지를 보여 주고 다시 입력할 수 있다.
  error?: unknown;
}

// 서버 검증 메시지 앞의 필드 이름("password: ...")은 화면에서 뺀다
const withoutFieldNames = (message: string) =>
  message.replace(/(^|, )(username|password): /g, "$1");

// 로그인·회원가입 입력(로그인 화면과 관리 화면의 다시 로그인 창이 함께 쓴다).
// 회원가입은 비밀번호를 한 번 더 받아 오타를 막고, 아이디·비밀번호 규칙은 서버가 검사해 그 메시지를 보여 준다.
export function AuthForm({ mode, onSubmit, loading, error }: AuthFormProps) {
  const signup = mode === "signup";
  const form = useForm(
    { username: "", password: "", passwordConfirm: "" },
    ({ username, password, passwordConfirm }) => ({
      username: username.trim() ? undefined : "아이디를 입력해주세요.",
      password: password ? undefined : "비밀번호를 입력해주세요.",
      passwordConfirm:
        !signup || passwordConfirm === password
          ? undefined
          : "비밀번호가 일치하지 않습니다.",
    })
  );

  return (
    <form
      onSubmit={form.handleSubmit(({ username, password }) =>
        onSubmit({ username, password })
      )}
    >
      <Field
        label='아이디'
        required
        help={signup ? "글자·숫자와 @ . + - _ 만 쓸 수 있습니다." : undefined}
        error={form.errors.username}
      >
        <Input
          value={form.values.username}
          onChange={(value) => form.set("username", value)}
          autoComplete='username'
          // 화면의 첫 입력이라 바로 입력할 수 있게 한다
          // eslint-disable-next-line jsx-a11y-x/no-autofocus
          autoFocus
        />
      </Field>
      <Field
        label='비밀번호'
        required
        help={
          signup
            ? "8자 이상. 흔한 비밀번호나 숫자로만 된 비밀번호는 쓸 수 없습니다."
            : undefined
        }
        error={form.errors.password}
      >
        <Input
          type='password'
          value={form.values.password}
          onChange={(value) => form.set("password", value)}
          autoComplete={signup ? "new-password" : "current-password"}
        />
      </Field>
      {signup && (
        <Field
          label='비밀번호 확인'
          required
          error={form.errors.passwordConfirm}
        >
          <Input
            type='password'
            value={form.values.passwordConfirm}
            onChange={(value) => form.set("passwordConfirm", value)}
            autoComplete='new-password'
          />
        </Field>
      )}
      {error != null && (
        <Alert
          title={withoutFieldNames(getErrorMessage(error))}
          style={{ marginBottom: "var(--ui-space-4)" }}
        />
      )}
      <Button
        type='submit'
        variant='primary'
        loading={loading}
        style={{ width: "100%" }}
      >
        {signup ? "가입하기" : "로그인"}
      </Button>
    </form>
  );
}
