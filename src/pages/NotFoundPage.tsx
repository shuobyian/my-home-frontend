import { ROUTES } from "@/app/routes";
import { Button, Result } from "@/ui";
import { useNavigate } from "react-router";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Result
      status='404'
      title='페이지를 찾을 수 없습니다.'
      description='주소를 다시 확인해주세요.'
      actions={
        <Button variant='primary' onClick={() => navigate(ROUTES.HOME)}>
          홈으로
        </Button>
      }
    />
  );
}
