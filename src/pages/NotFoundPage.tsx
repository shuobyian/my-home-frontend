import { Button, Result } from "antd";
import { ROUTES } from "app/routes";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Result
      status='404'
      title='페이지를 찾을 수 없습니다.'
      subTitle='주소를 다시 확인해주세요.'
      extra={
        <Button type='primary' onClick={() => navigate(ROUTES.HOME)}>
          홈으로
        </Button>
      }
    />
  );
}
