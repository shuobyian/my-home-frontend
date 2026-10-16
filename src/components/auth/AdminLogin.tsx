import { Alert, Button, Form, Input, Space, Typography } from "antd";
import { getErrorMessage } from "apis/errors";
import { ROUTES } from "app/routes";
import { Panel } from "components/common/Panel";
import { useLoginMutation } from "queries/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface AdminLoginProps {
  onSuccess: () => void;
}

// 관리 화면 비밀번호 입력. 실패하면 서버 메시지를 보여 주고 다시 입력할 수 있다.
export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const navigate = useNavigate();
  const { mutate: login, isLoading } = useLoginMutation();
  const [error, setError] = useState<string>();

  const submit = ({ password }: { password: string }) => {
    setError(undefined);
    login(password, {
      onSuccess,
      onError: (loginError) => setError(getErrorMessage(loginError)),
    });
  };

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
          <Button type='primary' htmlType='submit' loading={isLoading}>
            확인
          </Button>
          <Button onClick={() => navigate(ROUTES.HOME)}>취소</Button>
        </Space>
      </Form>
    </Panel>
  );
}
