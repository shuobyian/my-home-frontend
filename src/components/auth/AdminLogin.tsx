import { Alert, Button, Form, Input, Space, Typography } from "antd";
import { ROUTES } from "@/app/routes";
import { Panel } from "@/components/common/Panel";
import { useNavigate } from "react-router-dom";

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

  const submit = ({ password }: { password: string }) => onSubmit(password);

  return (
    <Panel style={{ maxWidth: 420, margin: "40px auto" }}>
      <Typography.Title level={4}>관리자만 입장 가능합니다.</Typography.Title>
      <Typography.Paragraph>
        입장하시려면 비밀번호를 입력해주세요.
      </Typography.Paragraph>
      <Form layout='vertical' onFinish={submit} requiredMark={false}>
        <Form.Item
          name='password'
          rules={[{ required: true, message: "비밀번호를 입력해주세요." }]}
        >
          <Input.Password
            placeholder='비밀번호 입력'
            autoComplete='current-password'
            // 게이트 화면의 유일한 입력이라 바로 입력할 수 있게 한다
            // eslint-disable-next-line jsx-a11y-x/no-autofocus
            autoFocus
          />
        </Form.Item>
        {error && (
          <Alert
            type='error'
            showIcon
            message={error}
            style={{ marginBottom: 16 }}
          />
        )}
        <Space>
          <Button type='primary' htmlType='submit' loading={loading}>
            확인
          </Button>
          <Button onClick={() => navigate(ROUTES.HOME)}>취소</Button>
        </Space>
      </Form>
    </Panel>
  );
}
