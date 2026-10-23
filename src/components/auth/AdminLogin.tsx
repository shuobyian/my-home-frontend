import { ROUTES } from "@/app/routes";
import { Panel } from "@/components/common/Panel";
import { useNavigate } from "react-router";
import {
  Alert,
  Button,
  Field,
  Input,
  Paragraph,
  Stack,
  Title,
  useForm,
} from "@/ui";

interface AdminLoginProps {
  onSubmit: (password: string) => void;
  // 확인 요청 중
  loading?: boolean;
  // 확인에 실패한 이유(서버 메시지). 다시 입력할 수 있다.
  error?: string;
}

// 관리 화면 비밀번호 입력
export function AdminLogin({ onSubmit, loading, error }: AdminLoginProps) {
  const navigate = useNavigate();
  const form = useForm({ password: "" }, ({ password }) => ({
    password: password ? undefined : "비밀번호를 입력해주세요.",
  }));

  return (
    <Panel style={{ maxWidth: 420, margin: "40px auto" }}>
      <Title level={4}>관리자만 입장 가능합니다.</Title>
      <Paragraph>입장하시려면 비밀번호를 입력해주세요.</Paragraph>
      <form onSubmit={form.handleSubmit(({ password }) => onSubmit(password))}>
        {/* 화면에는 안내 문구만 두고 라벨은 스크린 리더에만 읽힌다 */}
        <Field label='비밀번호' hideLabel required error={form.errors.password}>
          <Input
            type='password'
            value={form.values.password}
            onChange={(value) => form.set("password", value)}
            placeholder='비밀번호 입력'
            autoComplete='current-password'
            // 게이트 화면의 유일한 입력이라 바로 입력할 수 있게 한다
            // eslint-disable-next-line jsx-a11y-x/no-autofocus
            autoFocus
          />
        </Field>
        {error && (
          <Alert title={error} style={{ marginBottom: "var(--ui-space-4)" }} />
        )}
        <Stack>
          <Button type='submit' variant='primary' loading={loading}>
            확인
          </Button>
          <Button onClick={() => navigate(ROUTES.HOME)}>취소</Button>
        </Stack>
      </form>
    </Panel>
  );
}
