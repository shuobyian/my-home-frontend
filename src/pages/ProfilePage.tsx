import { getErrorMessage } from "@/apis/errors";
import { ROUTES } from "@/app/routes";
import { Avatar } from "@/components/common/Avatar";
import { Panel } from "@/components/common/Panel";
import { useUpdateProfileMutation } from "@/queries/auth";
import { useCurrentUser } from "@/state/auth";
import { User } from "@/types/auth";
import { createPath, Navigate, useLocation } from "react-router";
import {
  Alert,
  Button,
  Field,
  Form,
  Input,
  Stack,
  Text,
  Title,
  useForm,
  useToast,
} from "@/ui";

// 프로필: 로그인한 회원의 정보를 보여 주고 닉네임을 바꾼다. 아이디는 바꿀 수 없다.
export function ProfilePage() {
  const user = useCurrentUser();
  const location = useLocation();

  // 로그인하면 이 화면으로 돌아온다
  if (!user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: createPath(location) }}
        replace
      />
    );
  }

  return (
    <Stack vertical>
      <Title level={4}>프로필</Title>
      {/* 다른 계정으로 바꿔 로그인하면 입력하던 값을 지운다 */}
      <ProfileForm key={user.id} user={user} />
    </Stack>
  );
}

function ProfileForm({ user }: { user: User }) {
  const toast = useToast();
  const save = useUpdateProfileMutation();
  const form = useForm({ nickname: user.nickname }, ({ nickname }) => ({
    nickname: nickname.trim() ? undefined : "닉네임을 입력해주세요.",
  }));
  // 서버는 앞뒤 공백을 빼고 저장하므로 같은 기준으로 비교한다
  const unchanged = form.values.nickname.trim() === user.nickname;

  return (
    <Panel style={{ maxWidth: 480, padding: "var(--ui-space-5)" }}>
      <Stack gap={16} style={{ marginBottom: "var(--ui-space-5)" }}>
        <Avatar name={user.nickname} size={56} />
        <Stack vertical gap={0} style={{ minWidth: 0 }}>
          <Text strong style={{ fontSize: 18 }}>
            {user.nickname}
          </Text>
          <Text tone='secondary'>
            아이디 {user.username}
            {user.isAdmin && " · 관리자"}
          </Text>
        </Stack>
      </Stack>
      <Form
        onSubmit={form.handleSubmit(({ nickname }) =>
          save.mutate(
            { nickname },
            {
              onSuccess: (saved) => {
                form.set("nickname", saved.nickname);
                toast.success("프로필을 저장했습니다.");
              },
            }
          )
        )}
      >
        <Field
          label='닉네임'
          required
          help='게임에서 쓰는 닉네임. 20자까지 쓸 수 있습니다.'
          error={form.errors.nickname}
        >
          <Input
            value={form.values.nickname}
            onChange={(value) => form.set("nickname", value)}
            maxLength={20}
            autoComplete='nickname'
          />
        </Field>
        {save.error != null && (
          <Alert
            // 서버 검증 메시지 앞의 필드 이름("nickname: ...")은 화면에서 뺀다
            title={getErrorMessage(save.error).replace(/^nickname: /, "")}
          />
        )}
        <Button
          type='submit'
          variant='primary'
          loading={save.isPending}
          disabled={unchanged}
        >
          저장하기
        </Button>
      </Form>
    </Panel>
  );
}
