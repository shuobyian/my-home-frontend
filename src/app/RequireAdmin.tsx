import { Button, Segmented, Space } from "antd";
import { ROUTES } from "app/routes";
import { AdminLogin } from "components/auth/AdminLogin";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "state/auth";

const MANAGE_MENU = [
  { label: "Raw 엑셀 데이터", value: ROUTES.MANAGE },
  { label: "물품 리스트", value: ROUTES.MANAGE_PRODUCT },
  { label: "시세 리스트", value: ROUTES.MANAGE_MARKET },
];

// 관리 화면 게이트. 비밀번호를 확인하기 전에는 관리 화면을 그리지 않아
// 관리 API 요청과 관리 화면 코드 다운로드가 일어나지 않는다.
// 서버에 인증이 없으므로 화면을 숨기는 용도일 뿐이다(R10, 서버 인증은 별도 작업).
export function RequireAdmin() {
  const { isAdmin, markAdmin, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (!isAdmin) return <AdminLogin onSuccess={markAdmin} />;

  return (
    <Space direction='vertical' style={{ width: "100%" }} size='large'>
      <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
        <Segmented
          options={MANAGE_MENU}
          value={pathname}
          onChange={(value) => navigate(String(value))}
        />
        <Button onClick={logout}>관리 종료</Button>
      </Space>
      <Outlet />
    </Space>
  );
}
